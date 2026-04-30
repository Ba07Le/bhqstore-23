const User = require("../models/User")
const bcrypt = require("bcryptjs") // ✅ thêm dòng này

exports.getById = async (req, res) => {
    try {
        const { id } = req.params
        const result = (await User.findById(id)).toObject()
        delete result.password

        res.status(200).json(result)

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Không thể lấy thông tin của bạn, vui lòng thử lại sau.' })
    }
}

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params

        let updateData = { ...req.body }

        // ✅ CHỈ thêm đoạn này (KHÔNG phá code cũ)
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10)
        }

        const updated = (await User.findByIdAndUpdate(id, updateData, { new: true })).toObject()

        delete updated.password

        // ✅ thêm message success
        res.status(200).json({
            ...updated,
            message: "Cập nhật user thành công"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Không thể cập nhật thông tin, vui lòng thử lại sau.' })
    }
}