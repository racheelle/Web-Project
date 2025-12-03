import db from "../utils/database.js";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export const getContact = (req, res) => {
  res.render("contact", {
    pageTitle: "Contact Us",
    success: false,
    user: req.session.user || null
  });
};

export const postContact = async (req, res) => {
  try {
    const { fname, lname, email, message } = req.body;

    // 1️⃣ Save to DATABASE
    await db.query(
      `INSERT INTO contact_messages (fname, lname, email, message)
       VALUES (?, ?, ?, ?)`,
      [fname, lname, email, message]
    );

    // 2️⃣ Save to TEXT FILE
    const msgPath = path.join(process.cwd(), "messages");
    if (!fs.existsSync(msgPath)) fs.mkdirSync(msgPath);

    const fileContent =
      `----- NEW MESSAGE -----\n` +
      `FROM: ${fname} ${lname}\n` +
      `EMAIL: ${email}\n` +
      `MESSAGE:\n${message}\n` +
      `DATE: ${new Date().toLocaleString()}\n\n`;

    fs.appendFileSync(
      path.join(msgPath, "messages.txt"),
      fileContent,
      "utf8"
    );

    // 3️⃣ Optional — Send to email (activate if you want)
    /*  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "YOUR_EMAIL@gmail.com",
        pass: "YOUR_APP_PASSWORD"
      }
    });

    await transporter.sendMail({
      from: email,
      to: "YOUR_EMAIL@gmail.com",
      subject: "New Contact Message",
      text: fileContent
    });
    */

    res.render("contact", {
      pageTitle: "Contact Us",
      success: true,
      user: req.session.user || null
    });

  } catch (err) {
    console.log("CONTACT ERROR:", err);
    res.status(500).send("Error sending message");
  }
};
