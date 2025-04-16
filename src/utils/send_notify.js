const fetchURL = "https://api.pushalert.co/rest/v1/send";

module.exports = sendNotification = async (params) => {
  return new Promise((resolve, reject) => {
    const { title, message, url, largeImage, icon, actions } = params;
    const res = {
      title: title,
      message: message,
      icon: icon,
      url: url ? url : "https://eshansky7.live",
      largeImage: largeImage ? largeImage : "",
      action1: actions ? (actions[0] ? actions[0] : "") : "",
      action2: actions ? (actions[1] ? actions[1] : "") : "",
    };
    try {
      fetch(fetchURL, {
        method: "POST",
        headers: {
          Authorization: `api_key=9b7626c3f402472c60b97430be0409a1`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(res),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            resolve(data);
          } else {
            reject(data)
          }
        });
    } catch (e) {
      console.log(e);
      reject(e)
    }
  });
};
