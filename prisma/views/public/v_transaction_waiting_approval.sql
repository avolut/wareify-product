SELECT
  gen_random_uuid() AS id,
  tanggal,
  (count(*)) :: integer AS jumlah_status
FROM
  (
    SELECT
      t_work_order.complaint_date_request AS tanggal
    FROM
      t_work_order
    WHERE
      (
        (
          (t_work_order.status) :: text = 'Waiting Approval' :: text
        )
        AND (
          (t_work_order.status) :: text = 'Request to Compelete' :: text
        )
        AND (t_work_order.id_complaint_user IS NOT NULL)
        AND (t_work_order.complaint_date_request IS NOT NULL)
      )
    UNION
    ALL
    SELECT
      t_complaint.complaint_date AS tanggal
    FROM
      t_complaint
    WHERE
      (
        (
          (t_complaint.status) :: text = 'Waiting Checking' :: text
        )
        AND (t_complaint.complaint_date IS NOT NULL)
      )
    UNION
    ALL
    SELECT
      m_maintenance_schedule_header.created_at AS tanggal
    FROM
      m_maintenance_schedule_header
    WHERE
      (
        (
          (m_maintenance_schedule_header.approval_status) :: text = 'Waiting Approval' :: text
        )
        AND (
          m_maintenance_schedule_header.created_at IS NOT NULL
        )
      )
    UNION
    ALL
    SELECT
      t_opname.date_opname AS tanggal
    FROM
      t_opname
    WHERE
      (
        (
          (t_opname.status) :: text = 'Waiting Approval' :: text
        )
        AND (t_opname.date_opname IS NOT NULL)
      )
    UNION
    ALL
    SELECT
      t_disposal.date_disposal AS tanggal
    FROM
      t_disposal
    WHERE
      (
        (
          (t_disposal.status) :: text = 'Waiting Approval' :: text
        )
        AND (t_disposal.date_disposal IS NOT NULL)
      )
  ) combined_dates
GROUP BY
  tanggal
HAVING
  (count(*) > 0)
ORDER BY
  tanggal;