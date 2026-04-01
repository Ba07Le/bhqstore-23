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

  const sideTitle = mode === 'create' ? 'Muc do san sang' : 'Tinh trang listing'
  const sideDescription =
    mode === 'create'
      ? `Listing dat ${completionRate}% checklist dang ban.`
      : `Listing dat ${completionRate}% checklist van hanh.`
  const noteTitle = mode === 'create' ? 'Goi y dang ban' : 'Luu y toi uu'
  const noteDescription =
    mode === 'create'
      ? 'Dat ten ro rang, mo ta du thong tin va dung bo anh day du se giup listing de duoc duyet va hien thi tot hon.'
      : 'Moi lan cap nhat gia, ton kho hoac media nen di kem mot lan kiem tra lai readiness de listing khong bi mat hieu qua ban hang.'

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
            <AdminSurface title="Thong tin co ban">
              <Stack rowGap={3}>
                <TextField
                  label="Ten san pham"
                  {...register('title', {
                    required: 'Bat buoc',
                    minLength: { value: 3, message: 'Toi thieu 3 ky tu' },
                  })}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.brand}>
                      <InputLabel id={`${mode}-brand-selection`}>Thuong hieu</InputLabel>
                      <Select
                        labelId={`${mode}-brand-selection`}
                        label="Thuong hieu"
                        defaultValue={defaultValues.brand}
                        {...register('brand', { required: 'Bat buoc' })}
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
                      <InputLabel id={`${mode}-category-selection`}>Danh muc</InputLabel>
                      <Select
                        labelId={`${mode}-category-selection`}
                        label="Danh muc"
                        defaultValue={defaultValues.category}
                        {...register('category', { required: 'Bat buoc' })}
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
                  label="Mo ta san pham"
                  multiline
                  rows={5}
                  {...register('description', {
                    required: 'Bat buoc',
                    minLength: { value: 10, message: 'Toi thieu 10 ky tu' },
                  })}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Stack>
            </AdminSurface>

            <AdminSurface title="Gia ban va ton kho">
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Gia san pham"
                    type="number"
                    {...register('price', {
                      required: 'Bat buoc',
                      min: { value: 1, message: 'Gia phai lon hon 0' },
                    })}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="So luong ton kho"
                    type="number"
                    {...register('stockQuantity', {
                      required: 'Bat buoc',
                      min: { value: 0, message: 'Khong duoc nho hon 0' },
                    })}
                    error={!!errors.stockQuantity}
                    helperText={errors.stockQuantity?.message}
                  />
                </Grid>
              </Grid>
            </AdminSurface>

            <AdminSurface title={mode === 'create' ? 'Media listing' : 'Cap nhat media'}>
              <Stack rowGap={3}>
                <TextField
                  label={mode === 'create' ? 'Thumbnail san pham' : 'Thay thumbnail'}
                  type="file"
                  inputProps={{ accept: 'image/*' }}
                  {...register('thumbnail', {
                    required: mode === 'create' ? 'Bat buoc' : false,
                  })}
                  error={!!errors.thumbnail}
                  helperText={errors.thumbnail?.message}
                />

                <Stack rowGap={2}>
                  {productImageFieldNames.map((fieldName, index) => (
                    <TextField
                      key={fieldName}
                      label={`Anh chi tiet ${index + 1}`}
                      type="file"
                      inputProps={{ accept: 'image/*' }}
                      {...register(fieldName, {
                        required: mode === 'create' ? 'Bat buoc' : false,
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
                      label={item.done ? 'Dat' : mode === 'create' ? 'Thieu' : 'Can xem lai'}
                    />
                  </Stack>
                ))}
              </Stack>

              <Stack rowGap={1}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Thumbnail
                </Typography>

                {thumbnailFile ? (
                  renderPreviewImage(URL.createObjectURL(thumbnailFile), title || 'thumbnail')
                ) : initialProduct?.thumbnail ? (
                  <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                    {renderPreviewImage(getImageUrl(initialProduct.thumbnail), initialProduct.title)}
                    <Typography color="text.secondary">
                      Dang dung thumbnail hien tai
                    </Typography>
                  </Stack>
                ) : (
                  <Typography color="text.secondary">Chua chon thumbnail</Typography>
                )}
              </Stack>

              <Stack rowGap={1}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Bo anh chi tiet
                </Typography>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {selectedGalleryFiles.length
                    ? selectedGalleryFiles.map((file) => (
                        <React.Fragment key={file.name}>
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
                  <Typography color="text.secondary">Chua co anh chi tiet</Typography>
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
            Huy
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
