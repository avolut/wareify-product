import html2canvas from "html2canvas";

export const QrDownload = (id: string) => {
  const labelElement = document.getElementById(id);
  if (labelElement) {
    html2canvas(labelElement).then((canvas) => {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "label-with-qr.png";
      link.click();
    });
  }
};

export const QrSendToApi = (id: string, apiUrl: string, address: string) => {
  const labelElement = document.getElementById(id);
  if (labelElement) {
    html2canvas(labelElement)
      .then((canvas) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append("image", blob, "label-with-qr.png");
            formData.append("printAddress", address);

            fetch(apiUrl, {
              method: "POST",
              body: formData,
              headers: {
                // "Accept": "application/json",
                // "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
              },
            })
              .then((response) => response.json())
              .then((data) => {
                console.log("Image uploaded successfully:", data);
              })
              .catch((error: any) => {
                console.error("Error uploading image:", error.message);
              });
          }
        }, "image/png");
      })
      .catch((error: any) => {
        console.error("Error when creating image:", error.message);
      });
  }
};

export const printQrZpl = async (
  idAsset: string,
  apiUrl: string,
  address: string
) => {
  if (!idAsset) {
    console.error("Asset not found");
    return;
  }

  const asset = await db.m_asset.findFirst({
    where: {
      id: String(idAsset),
    },
  });

  if (!asset) {
    console.error("Asset not found");
    return;
  }

  const body = {
    printAddress: address,
    qrCode: asset.id,
    date:
      asset.acquired_date != null
        ? new Date(asset.acquired_date.toString()).toDateString()
        : "-",
    codeification: asset.codeification !== "" ? asset.codeification : "-",
    name: asset.name,
  };
  console.log("body", body);
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to send the data:", errorData);
    } else {
      const responseData = await response.json();
      console.log("Successfully sent the data:", responseData);
    }
  } catch (error) {
    console.error("Error sending data to API:", error);
  }
};

export const printQrLocationZpl = async (
  idLocation: string,
  apiUrl: string,
  address: string
) => {
  if (!idLocation) {
    console.error("Asset not found");
    return;
  }

  const location = await db.m_location.findFirst({
    where: {
      id: String(idLocation),
    },
  });

  if (!location) {
    console.error("Location not found");
    return;
  }

  const body = {
    printAddress: address,
    qrCode: location.id,
    name: location.name,
  };
  console.log("body", body);
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to send the data:", errorData);
    } else {
      const responseData = await response.json();
      console.log("Successfully sent the data:", responseData);
    }
  } catch (error) {
    console.error("Error sending data to API:", error);
  }
};

export const printZplMultiple = async (
  idAssets: string[],
  apiUrl: string,
  address: string
) => {
  if (idAssets.length === 0) {
    console.error("Assets not found");
    return;
  }

  for (const e of idAssets) {
    const asset = await db.m_asset.findFirst({
      where: {
        id: String(e),
      },
    });

    if (!asset) {
      console.error(`Asset with id ${e} not found`);
      continue;
    }

    const body = {
      qrCode: asset.id,
      date: asset.acquired_date
        ? new Date(asset.acquired_date.toString()).toDateString()
        : "-",
      codeification: asset.codeification !== "" ? asset.codeification : "-",
      name: asset.name,
    };

    const urlWithParams = `${apiUrl}?printAddress=${encodeURIComponent(
      address
    )}`;

    try {
      const response = await fetch(urlWithParams, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get("content-type");
      if (
        response.ok &&
        contentType &&
        contentType.includes("application/json")
      ) {
        const responseData = await response.json();
        console.log("Successfully sent the data:", responseData);
      } else {
        const responseText = await response.text();
        console.error("Failed to send the data:", responseText);
      }
    } catch (error) {
      console.error("Error sending data to API:", error);
    }
  }

  console.log("Success print multiple ZPLs");
};

export const multipleDownloads = (idAssets: string[]) => {
  // const ids = idAssets.slice(0, 5);
  idAssets.forEach((e) => {
    setTimeout(() => {
      const labelElement = document.getElementById(e);
      if (labelElement) {
        html2canvas(labelElement).then((canvas) => {
          const url = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = url;
          link.download = `${e}.png`;
          link.click();
        });
      }
    }, 1000);
  });
};

export const sendMultipleQrsToApi = (
  idAssets: string[],
  apiUrl: string,
  address: string
) => {
  // const ids = idAssets.slice(0, 5);
  idAssets.forEach((e) => {
    const labelElement = document.getElementById(e);
    if (labelElement) {
      html2canvas(labelElement)
        .then((canvas) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const formData = new FormData();
              formData.append("image", blob, `${e}.png`);
              formData.append("printAddress", address);

              fetch(apiUrl, {
                method: "POST",
                body: formData,
                headers: {
                  // "Accept": "application/json",
                  // "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "POST",
                },
              })
                .then((response) => response.json())
                .then((data) => {
                  console.log("Image uploaded successfully:", data);
                })
                .catch((error: any) => {
                  console.error("Error uploading image:", error.message);
                });
            }
          }, "image/png");
        })
        .catch((error: any) => {
          console.error("Error when creating image:", error.message);
        });
    } else {
      console.error("Cannot find the QR");
    }
  });
};
