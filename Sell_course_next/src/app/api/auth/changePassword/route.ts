import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = req.cookies["authjs.session-token"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  try {
    // Giả lập lấy user từ token
    const user = {
      id: 1,
      passwordHash: "$2a$10$exampleHashedPassword12345", // Mật khẩu hash hiện tại
    };

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Giả lập lưu mật khẩu mới
    console.log(`Updating user ${user.id} password to ${newPasswordHash}`);

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
}
