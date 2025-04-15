const { google } = require("googleapis");

const CLIENT_EMAIL =
  "black-heart-lizard@whatsapp-bot-454901.iam.gserviceaccount.com";
const PRIVATE_KEY =
  "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDC2Gg///sp8ho/\nrIA6TYueyh/ao5iFB8ZlJFe+2wFFdYmpZVrTUhn8uT3zeEHgKg96g5yZqFAy8jMf\nXsdqteKnQt1jCQ1imHT06/s39jd5lJonb2wFm3yV5VlS41R4lEYqm0zPyGvzryxQ\nD+jLNOm+4ms0UWc9eq1Y3wVH7hGlorfjS37zGtAojI4qJGjnQ0wTcvmShCJHOoaZ\n+kfjwCl39aBpiuYcOFf+0FmaDgcXtS/jDzQcQ8prAPqOLZOBKvsHlj2e8eBadqKC\n/XWMzzzSZKgUXhyC9wiYjyCrEOUiGfIChqDvSlypKGcBweWmuN934rqcMro9dBTP\nCmC4LZq3AgMBAAECggEAMiuc9FXKa2uOfLTDM8AB4nozJ44WWLK+0A5Clb84nZT9\nRGP3thAe5ucf35AojjrmT2qSKTKgq+2XYk16VazN1rmt3bFYA/ozq1kUD73TXPf5\nlYvoKa12r/YlQOWOO5oaUyA38AywV0fUxizCiYhvY5pTdl47kiYDeq26Y2IWoypF\n2OnhlPbQH2yY6t5dE1S+08qxAewjkrX2yAWWfAHBtpY0FOimCS2PV89bz2ve3cJQ\n77pNyzg5wN+6zW47rn0QyzEoA6+BiAIQAO9Ztp28MsgF2invai4Fj9o2ntnYfR4R\nj7rRmEDq+KiZhgK9GirsYa+hXhCxtVEiAzGu9WNgqQKBgQD/VCzf3L2I23D5B7vl\nUNW4d4QxlSacod7QhEnk8C0WckY9bdsL2isPh77AdJn7q/Z1fgRO/0LaAsIjcVoa\naaURNkvZXxk3M7/MmZLCbXRjgw9w3g4xggFg1XKtKSFvowM4YDxOKh1SZmr38Xql\nyHItvXEiSUBfKRzLpphBdLNkfQKBgQDDW4eAedSbel1+HSexHleTwK7D6iwuNMk0\nGu6u/dN2K6hl7KwfGpHNs2vG0980KLBxNlBtk/gryFPHwfw/0BMRwdkQ2FiemZsH\nM0qHV19L7euqcYZ+AL2W7MmdIlMbpJTbQSnx4D9NQm2LPaoBwx7spAlzGb0BSS6I\nfUSX8VrmQwKBgQCmGZJfx3AdefQSbS+UzHNcX5PF1auatcsHhyezIXOTaJ+9Epwv\nJ6xfnAVBmhkaGhJo+KPA6FoLDURSXkkpaZSSj+nj7POwb5/UcAuDJEVU/0uqNyqw\nlkxjPDgv4dP4lelgYWqZxtfwZOQtjBAnjTCKBPV2QoT34vzyltvxqQOS2QKBgCvW\nNBe+PtkMokIUZL2340sCZ7UKrRNJQQTyLjESQAs6TLViYFUybxlLc5nQHTvlDYK5\n/143X+7jKvmeK+5d0ImhiAXhpjEgossA1W59SqMNJl6+zsEjhWeChtM9yoxfaA+z\nFahy+4FosJAYLDftAtlzDbPISMMrGsgB5Ax8WjtlAoGAfVW2X0vNiBu+S0f+WNZ9\nhArX5N2pSsv97/qfYDwZJSVFePurcBNYT5S9Tl3jvvbcntR1IpQQ7f0qB4s5s5mh\nFxDzO4aW1KsowsHqnnHt9Bn8YGL0QHTXgSnq+Q8wR3nhMaYCQd1zvPNFmUGFQyos\n8SXWbkzO42nCAZ+qPi92bT0=\n-----END PRIVATE KEY-----\n";
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

class GoogleAuth {
  constructor() {
    try {
      this.auth = new google.auth.JWT(CLIENT_EMAIL, null, PRIVATE_KEY, SCOPES);
      this.drive = google.drive({ version: "v3", auth: this.auth });
      this.sheets = google.sheets({ version: "v4", auth: this.auth });
    } catch (e) {
      throw new Error("Error in Google Auth: " + e);
    }
  }
}

class GoogleCloud extends GoogleAuth {
  constructor(ROOT_FOLDER_ID, SHEET_ID) {
    super();
    this.ROOT_FOLDER_ID = ROOT_FOLDER_ID
      ? ROOT_FOLDER_ID
      : "1tMlnKRs9lNI07-nqN3JKUDWJZQGg7rC3";
    this.SHEET_ID = SHEET_ID
      ? SHEET_ID
      : "1tMlnKRs9lNI07-nqN3JKUDWJZQGg7rC3";
  }
  // Perpare a target folers and files
  async uploadStatus(params, callback) {
    try {
      let {
        file: { fileName, mimeType },
        description,
        stream
      } = params;
      let date = new Date().toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: undefined,
        hour12: true,
      }).replace(", ", " ").replace(" at", "");
      // Upload status to Folder
      let file = await this.drive.files.create({
        resource: {
          name: fileName,
          mimeType: mimeType,
          parents: [this.ROOT_FOLDER_ID],
          description: description,
        },
        media: {
          mimeType: mimeType,
          body: stream,
        },
        fields: "id, webViewLink, webContentLink",
      });
    } catch (error) {
      callback(error, null);
    }
  }
}

module.exports = GoogleCloud;
