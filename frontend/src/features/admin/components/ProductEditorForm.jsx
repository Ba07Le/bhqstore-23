import React, { useMemo } from 'react'
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { productImageFieldNames } from '../adminConfig'
import { getProductEditorChecklist } from '../adminHelpers'
import { getImageUrl } from '../../../utils/imageUrl'
import { AdminSurface } from './AdminSurface'

const renderPreviewImage = (src, alt) => {
  if (!src) return null

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: 92,
        height: 92,
        objectFit: 'cover',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    />
  )
}

export const ProductEditorForm = ({
  mode = 'create',
  introTitle,
  introDescription,
  chips = [],
  initialProduct = null,
  brands = [],
  categories = [],
  submitStatus = 'idle',
  submitLabel,
  pendingLabel,
  onSubmit,
}) => {
  const theme = useTheme()
  const is1100 = useMediaQuery(theme.breakpoints.down(1100))
  const is480 = useMediaQuery(theme.breakpoints.down(480))

  const defaultValues = useMemo(
    () => ({
      title: initialProduct?.title || '',
      description: initialProduct?.description || '',
      price: initialProduct?.price ?? '',
      stockQuantity: initialProduct?.stockQuantity ?? '',
      brand: initialProduct?.brand?._id || '',
      category: initialProduct?.category?._id || '',
    }),
    [initialProduct]
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues })

  const title = watch('title')
  const description = watch('description')
  const price = watch('price')
  const stockQuantity = watch('stockQuantity')
  const brand = watch('brand')
  const category = watch('category')
  const thumbnailFile = watch('thumbnail')?.[0]
  const galleryFiles = productImageFieldNames.map((fieldName) => watch(fieldName)?.[0])
  const selectedGalleryFiles = galleryFiles.filter(Boolean)

  const checklist = useMemo(
    () =>
      getProductEditorChecklist({
        title: title || initialProduct?.title,
        brand: brand || initialProduct?.brand?._id,
        category: category || initialProduct?.category?._id,
        description: description || initialProduct?.description,
        price: price || initialProduct?.price,
        stockQuantity:
          stockQuantity !== '' && stockQuantity !== undefined
            ? stockQuantity
            : initialProduct?.stockQuantity,
        hasThumbnail: Boolean(thumbnailFile || initialProduct?.thumbnail),
        imageCount: mode === 'create'
          ? selectedGalleryFiles.length
          : selectedGalleryFiles.length || initialProduct?.images?.filter(Boolean)?.length || 0,
        requireFullGallery: mode === 'create',
        targetImageCount: productImageFieldNames.length,
      }),
    [
      title,
      brand,
      category,
      description,
      price,
      stockQuantity,
      thumbnailFile,
      initialProduct,
      mode,
      selectedGalleryFiles.length,
    ]
  )

  const completionCount = checklist.filter((item) => item.done).length
  const completionRate = checklist.length
    ? Math.round((completionCount / checklist.length) * 100)
    : 0

  const sideTitle = mode === 'create' ? 'Mức độ sẵn sàng' : 'Tình trạng listing'
  const sideDescription =
    mode === 'create'
      ? `Sản phẩm đạt ${completionRate}% checklist đăng bán.`
      : `Sản phẩm đạt ${completionRate}% checklist vận hành.`
  const noteTitle = mode === 'create' ? 'Gợi ý đăng bán' : 'Lưu ý tối ưu'
  const noteDescription =
    mode === 'create'
      ? 'Đặt tên rõ ràng, mô tả đủ thông tin và dùng bộ ảnh đầy đủ sẽ giúp sản phẩm dễ được duyệt và hiển thị tốt hơn.'
      : 'Mỗi lần cập nhật giá, tồn kho hoặc media nên đi kèm một lần kiểm tra lại độ sẵn sàng để sản phẩm không bị mất hiệu quả bán hàng.'

  return (
    <Stack rowGap={3}>
      <AdminSurface
        title={introTitle}
        description={introDescription}
        actions={
          <Stack direction="row" gap={1} flexWrap="wrap">
            {chips.map((item) => (
              <Chip key={item.label} icon={item.icon} label={item.label} variant="outlined" />
            ))}
          </Stack>
        }
      />

      <Stack component="form" rowGap={3} noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack direction={is1100 ? 'column' : 'row'} gap={3} alignItems="flex-start">
          <Stack flex={1} rowGap={3} width="100%">
            <AdminSurface title="Thông tin cơ bản">
              <Stack rowGap={3}>
                <TextField
                  label="Tên sản phẩm"
                  {...register('title', {
                    required: 'Bắt buộc nhập tên sản phẩm',
                    minLength: { value: 3, message: 'Tối thiểu 3 ký tự' },
                  })}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.brand}>
                      <InputLabel id={`${mode}-brand-selection`}>Thương hiệu</InputLabel>
                      <Select
                        labelId={`${mode}-brand-selection`}
                        label="Thương hiệu"
                        defaultValue={defaultValues.brand}
                        {...register('brand', { required: 'Vui lòng chọn thương hiệu' })}
                      >
                        {brands.map((item) => (
                          <MenuItem key={item._id} value={item._id}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography color="error" variant="caption" mt={0.5}>
                        {errors.brand?.message}
                      </Typography>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel id={`${mode}-category-selection`}>Danh mục</InputLabel>
                      <Select
                        labelId={`${mode}-category-selection`}
                        label="Danh mục"
                        defaultValue={defaultValues.category}
                        {...register('category', { required: 'Vui lòng chọn danh mục' })}
                      >
                        {categories.map((item) => (
                          <MenuItem key={item._id} value={item._id}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography color="error" variant="caption" mt={0.5}>
                        {errors.category?.message}
                      </Typography>
                    </FormControl>
                  </Grid>
                </Grid>

                <TextField
                  label="Mô tả sản phẩm"
                  multiline
                  rows={5}
                  {...register('description', {
                    required: 'Bắt buộc nhập mô tả',
                    minLength: { value: 10, message: 'Tối thiểu 10 ký tự' },
                  })}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Stack>
            </AdminSurface>

            <AdminSurface title="Giá bán và tồn kho">
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giá sản phẩm"
                    type="number"
                    {...register('price', {
                      required: 'Bắt buộc nhập giá',
                      min: { value: 1, message: 'Giá phải lớn hơn 0' },
                    })}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số lượng tồn kho"
                    type="number"
                    {...register('stockQuantity', {
                      required: 'Bắt buộc nhập số lượng',
                      min: { value: 0, message: 'Không được nhỏ hơn 0' },
                    })}
                    error={!!errors.stockQuantity}
                    helperText={errors.stockQuantity?.message}
                  />
                </Grid>
              </Grid>
            </AdminSurface>

            <AdminSurface title={mode === 'create' ? 'Media sản phẩm' : 'Cập nhật media'}>
              <Stack rowGap={3}>
                <TextField
                  label={mode === 'create' ? 'Ảnh đại diện (Thumbnail)' : 'Thay đổi ảnh đại diện'}
                  type="file"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ accept: 'image/*' }}
                  {...register('thumbnail', {
                    required: mode === 'create' ? 'Vui lòng chọn ảnh đại diện' : false,
                  })}
                  error={!!errors.thumbnail}
                  helperText={errors.thumbnail?.message}
                />

                <Stack rowGap={2}>
                  {productImageFieldNames.map((fieldName, index) => (
                    <TextField
                      key={fieldName}
                      label={`Ảnh chi tiết ${index + 1}`}
                      type="file"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ accept: 'image/*' }}
                      {...register(fieldName, {
                        required: mode === 'create' ? 'Vui lòng chọn ảnh chi tiết' : false,
                      })}
                      error={!!errors[fieldName]}
                      helperText={errors[fieldName]?.message}
                    />
                  ))}
                </Stack>
              </Stack>
            </AdminSurface>
          </Stack>

          <AdminSurface
            sx={{
              width: is1100 ? '100%' : '26rem',
              position: is1100 ? 'static' : 'sticky',
              top: 24,
            }}
          >
            <Stack rowGap={3}>
              <Stack rowGap={1}>
                <Typography variant="h6" fontWeight={800}>
                  {sideTitle}
                </Typography>
                <Typography color="text.secondary">{sideDescription}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  sx={{ height: 10, borderRadius: 999 }}
                />
              </Stack>

              <Stack rowGap={1.2}>
                {checklist.map((item) => (
                  <Stack
                    key={item.label}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1}
                    borderBottom="1px solid"
                    borderColor="divider"
                  >
                    <Typography fontWeight={600}>{item.label}</Typography>
                    <Chip
                      size="small"
                      color={item.done ? 'success' : 'default'}
                      icon={item.done ? <CheckCircleRoundedIcon /> : undefined}
                      label={item.done ? 'Đạt' : mode === 'create' ? 'Thiếu' : 'Cần xem lại'}
                    />
                  </Stack>
                ))}
              </Stack>

              <Stack rowGap={1}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Ảnh đại diện
                </Typography>

                {thumbnailFile ? (
                  renderPreviewImage(URL.createObjectURL(thumbnailFile), title || 'thumbnail')
                ) : initialProduct?.thumbnail ? (
                  <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                    {renderPreviewImage(getImageUrl(initialProduct.thumbnail), initialProduct.title)}
                    <Typography variant="caption" color="text.secondary">
                      Đang dùng ảnh hiện tại
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.secondary">Chưa chọn ảnh</Typography>
                )}
              </Stack>

              <Stack rowGap={1}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Bộ ảnh chi tiết
                </Typography>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {selectedGalleryFiles.length
                    ? selectedGalleryFiles.map((file, idx) => (
                        <React.Fragment key={`${file.name}-${idx}`}>
                          {renderPreviewImage(URL.createObjectURL(file), file.name)}
                        </React.Fragment>
                      ))
                    : (initialProduct?.images || []).map((image, index) => (
                        <React.Fragment key={`${image}-${index}`}>
                          {renderPreviewImage(
                            getImageUrl(image),
                            `${initialProduct?.title || 'product'}-${index + 1}`
                          )}
                        </React.Fragment>
                      ))}
                </Stack>

                {!selectedGalleryFiles.length && !(initialProduct?.images || []).length ? (
                  <Typography variant="caption" color="text.secondary">Chưa có ảnh chi tiết</Typography>
                ) : null}
              </Stack>

              <AdminSurface
                sx={{
                  p: 2,
                  borderRadius: 4,
                  bgcolor: '#f8fafc',
                  borderStyle: 'dashed',
                }}
              >
                <Stack rowGap={0.8}>
                  <Typography fontWeight={700}>{noteTitle}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {noteDescription}
                  </Typography>
                </Stack>
              </AdminSurface>
            </Stack>
          </AdminSurface>
        </Stack>

        <Stack flexDirection="row" justifyContent="flex-end" columnGap={is480 ? 1 : 2}>
          <Button
            size={is480 ? 'medium' : 'large'}
            variant="outlined"
            color="inherit"
            component={Link}
            to="/admin/dashboard"
          >
            Hủy
          </Button>
          <Button
            size={is480 ? 'medium' : 'large'}
            variant="contained"
            type="submit"
            disabled={submitStatus === 'pending'}
          >
            {submitStatus === 'pending' ? pendingLabel : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}