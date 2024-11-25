import { prasiApi } from "lib/server/server-route";

export default prasiApi(async (data: Record<string, any>[]) => {
  const mapping = {
    table: "m_asset",
    columns: {
      //kolom_di_upload:kolom_di_db
      "id": "id",
      "name": "name",
      "lokasi": "m_location.name"
    }
  } 
  // check dulu dari data diatas apakah ada yg sudah terinsert
  
  // yg sudah ada di update data nya

  // yg belum di insert data nya
});
