SELECT
  gen_random_uuid() AS id,
  id_client,
  date((preventive_date AT TIME ZONE 'UTC' :: text)) AS date,
  STATUS,
  (count(*)) :: integer AS count
FROM
  t_preventive_work_order_header
GROUP BY
  id_client,
  (date((preventive_date AT TIME ZONE 'UTC' :: text))),
  STATUS
HAVING
  (count(*) > 0)
ORDER BY
  (date((preventive_date AT TIME ZONE 'UTC' :: text))),
  id_client,
  STATUS;