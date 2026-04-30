import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { updateUserByIdAsync } from "../UserSlice";
import { toast } from "react-toastify";
import { useEffect } from "react";

export const EditProfileModal = ({ open, handleClose, user }) => {

  const { register, handleSubmit, reset } = useForm();

  const dispatch = useDispatch();

  // ✅ reset form mỗi lần mở modal
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        password: ""
      });
    }
  }, [user, open, reset]);

  const onSubmit = async (data) => {

    let updateData = {};

    // ✅ chỉ lấy field thay đổi
    if (data.name && data.name !== user.name) {
      updateData.name = data.name;
    }

    if (data.email && data.email !== user.email) {
      updateData.email = data.email;
    }

    if (data.password) {
      updateData.password = data.password;
    }

    // ❌ không có gì thay đổi
    if (Object.keys(updateData).length === 0) {
      toast.warning("Chưa có thay đổi nào");
      return;
    }

    try {
      // ✅ unwrap để bắt success/reject chuẩn
      await dispatch(updateUserByIdAsync({
        _id: user._id,
        ...updateData
      })).unwrap();

      toast.success("Cập nhật profile thành công");
      handleClose();

    } catch (err) {
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Chỉnh sửa Profile</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Tên" {...register("name")} />
          <TextField label="Email" {...register("email")} />
          <TextField
            label="Mật khẩu mới"
            type="password"
            {...register("password")}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="error">X</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
};