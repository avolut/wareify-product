import get from "lodash.get";

export const handleOpenCamera = (local: any, id: string, fm: any) => {
  const w = window as any;
  console.log("mantap");
  if (w.AndroidBridge && w.AndroidBridge.openCamera) {
    w.AndroidBridge.openCamera();
  }
  w.onCameraResult = async (imagePath: any) => {
    console.log("Received image path:", imagePath);
    const imageName = getImageName(imagePath);
    let result = "";
    try {
      result = await handleResultFile(imagePath, imageName);
      console.log("result", result);
    } catch (error) {
      console.error("Error handle open file: ", error);
    }
    const user = await db.m_user.findFirst({
      where: {
        id: id,
      },
    });
    if (user) {
      await db.m_user.update({
        where: {
          id: user.id,
        },
        data: {
          photo: result,
        },
      });
    }
    const imageUrl = filePreview({ url: result });
    local.imageResult = imageUrl;
    fm.data.photo = imageUrl;
    fm.reload();
    local.render();
  };
};

const getImageName = (url: string) => {
  const baseUrl = "http://localhost:8080/";
  if (url.startsWith(baseUrl)) {
    return url.substring(baseUrl.length);
  }
  return url;
};

export const handleOpenFile = (local: any, id: string, fm: any) => {
  const w = window as any;
  if (w.AndroidBridge && w.AndroidBridge.openCamera) {
    w.AndroidBridge.openFilePicker();
  }
  w.onFilePicked = async (filePath: any) => {
    console.log("File received: " + filePath);
    const imageName = getImageName(filePath);
    let result = "";
    try {
      result = await handleResultFile(filePath, imageName);
      console.log("result", result);
    } catch (error) {
      console.error("Error handle open camera: ", error);
    }
    const user = await db.m_user.findFirst({
      where: {
        id: id,
      },
    });
    if (user) {
      await db.m_user.update({
        where: {
          id: user.id,
        },
        data: {
          photo: result,
        },
      });
    }
    const imageUrl = filePreview({ url: result });
    local.imageResult = imageUrl;
    fm.data.photo = imageUrl;
    fm.reload();
    local.render();
  };
};

export const handleOpenFileComplaint = (fm: any, local: any) => {
  const w = window as any;
  if (w.AndroidBridge && w.AndroidBridge.openFilePicker) {
    w.AndroidBridge.openFilePicker();
  }
  w.onFilePicked = async (filePath: any) => {
    console.log("File received: " + filePath);
    const imageName = getImageName(filePath);
    let result = "";
    try {
      result = await handleResultFile(filePath, imageName);
      console.log("result", result);
    } catch (error) {
      console.error("Error handle open file complaint: ", error);
    }
    fm.data.complaint_attachment = result;
    const imageUrl = filePreview({ url: result });
    local.attachment = imageUrl;
    fm.render();
    local.render();
  };
};

export const handleOpenFileFm = (fm: any, local: any, name: string) => {
  const w = window as any;
  if (w.AndroidBridge && w.AndroidBridge.openFilePicker) {
    w.AndroidBridge.openFilePicker();
  }
  w.onFilePicked = async (filePath: any) => {
    console.log("File received: " + filePath);
    const imageName = getImageName(filePath);
    let result = "";
    try {
      result = await handleResultFile(filePath, imageName);
      console.log("result", result);
    } catch (error) {
      console.error("Error handle open file fm: ", error);
    }
    fm.data[name] = result;
    const imageUrl = filePreview({ url: result });
    local[name] = imageUrl;
    fm.render();
    local.render();
  };
};

export const handleOpenWithChrome = (url: string) => {
  const w = window as any;
  if (w.AndroidBridge && w.AndroidBridge.openWithChrome) {
    w.AndroidBridge.openWithChrome(url);
  }
  console.log("Chrome Opened");
};

export const handleCameraScanner = () => {
  const w = window as any;
  if (w.AndroidBridge && w.AndroidBridge.openCameraScanner) {
    w.AndroidBridge.openCameraScanner();
  }
};

const handleResultFile = async (fileUrl: string, fileName: string) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    let url = siteurl("/_upload");
    if (
      location.hostname === "prasi.avolut.com" ||
      location.host === "localhost:4550"
    ) {
      const newurl = new URL(location.href);
      newurl.pathname = `/_proxy/${url}`;
      url = newurl.toString();
    }
    const apiResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (apiResponse.ok) {
      const contentType: any = apiResponse.headers.get("content-type");
      let result;
      if (contentType.includes("application/json")) {
        result = await apiResponse.json();
      } else if (contentType.includes("text/plain")) {
        result = await apiResponse.text();
      } else {
        result = await apiResponse.blob();
      }
      if (Array.isArray(result)) {
        const data = `_file${get(result, "[0]")}`;
        return data;
      } else {
        console.error("error get file result");
        alert("error get file result");
        return "";
      }
    } else {
      console.error("catched");
      return "";
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return "";
  }
};

export const filePreview = ({ url }: { url: string }) => {
  if (url.startsWith("_file/")) {
    if ([".png", ".jpeg", ".jpg", ".webp"].find((e) => url.endsWith(e))) {
      let _url = siteurl(url || "");
      return _url;
    } else {
      console.error("URL has invalid image type");
      return "";
    }
  } else {
    console.error("URL not _file");
    return "";
  }
};
