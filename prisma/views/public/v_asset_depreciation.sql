SELECT
  a.id,
  a.name AS asset_name,
  COALESCE(e.asset_period, NULL :: integer) AS asset_period,
  COALESCE(e.period, NULL :: timestamp WITH time zone) AS date_depre,
  COALESCE(
    e.remaining_amount,
    (a.asset_value) :: double precision
  ) AS remaining_amount,
  COALESCE(a.expense, NULL :: double precision) AS expense,
  COALESCE(
    (a.accumulated_depreciation_value) :: double precision,
    NULL :: double precision
  ) AS accumulated_depreciation,
  a.id AS id_asset,
  a.life,
  (
    a.expense * (
      (COALESCE(e.asset_period, NULL :: integer)) :: numeric
    ) :: double precision
  ) AS accumulated_expense,
  COALESCE(
    (
      SELECT
        sum(t_exp.expense) AS sum
      FROM
        t_depreciation_expense t_exp
      WHERE
        (t_exp.id_asset = a.id)
    ),
    (0) :: double precision
  ) AS total_expense
FROM
  (
    m_asset a
    LEFT JOIN (
      SELECT
        t.id_asset,
        t.asset_period,
        t.date_depre,
        t.remaining_amount,
        t.period,
        row_number() OVER (
          PARTITION BY t.id_asset
          ORDER BY
            t.period DESC
        ) AS rn
      FROM
        t_depreciation_expense t
    ) e ON (
      (
        (a.id = e.id_asset)
        AND (e.rn = 1)
      )
    )
  )
WHERE
  (
    (a.depreciate = TRUE)
    AND ((a.asset_status) :: text <> 'Dispose' :: text)
  );