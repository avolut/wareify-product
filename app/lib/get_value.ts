export const get_value = (data: any) => {
    let result = null as any;
    try {
      try {
        if (typeof data === "object") {
          if (typeof data?.connect?.id === "string") {
            result = data.connect.id;
          } else if (typeof data?.id === "string") {
            result = data.id;
          } else if (data?.disconnect === true) {
            result = null;
          }
        }
      } catch (ex) {
      }
    } catch (ex) {
  
    }
    return result;
  };
  