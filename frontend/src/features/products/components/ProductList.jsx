import { FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom';
import { fetchProductsAsync, resetProductFetchStatus, selectProductFetchStatus, selectProductIsFilterOpen, selectProductTotalResults, selectProducts, toggleFilters } from '../ProductSlice'
import { ProductCard } from './ProductCard'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AddIcon from '@mui/icons-material/Add';
import { selectBrands } from '../../brands/BrandSlice'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { selectCategories } from '../../categories/CategoriesSlice'
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import { ITEMS_PER_PAGE } from '../../../constants'
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, resetWishlistItemAddStatus, resetWishlistItemDeleteStatus, selectWishlistItemAddStatus, selectWishlistItemDeleteStatus, selectWishlistItems } from '../../wishlist/WishlistSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { toast } from 'react-toastify'
import { banner1, banner2, banner3, banner4, loadingAnimation } from '../../../assets'
import { resetCartItemAddStatus, selectCartItemAddStatus } from '../../cart/CartSlice'
import { motion } from 'framer-motion'
import { ProductBanner } from './ProductBanner'
import ClearIcon from '@mui/icons-material/Clear';
import Lottie from 'lottie-react'

const sortOptions = [
    { name: "Giá: từ thấp đến cao", sort: "price", order: "asc" },
    { name: "Giá: từ cao đến thấp", sort: "price", order: "desc" },
]

const bannerImages = [banner1, banner3, banner2, banner4]

export const ProductList = () => {
    const [filters, setFilters] = useState({})
    const [page, setPage] = useState(1)
    const [sort, setSort] = useState(null)
    const theme = useTheme()

    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("search");

    const [prevKeyword, setPrevKeyword] = useState(keyword);

    if (keyword !== prevKeyword) {
        setFilters({});
        setPage(1);
        setPrevKeyword(keyword);
    }

    const is1200 = useMediaQuery(theme.breakpoints.down(1200))
    const is800 = useMediaQuery(theme.breakpoints.down(800))
    const is700 = useMediaQuery(theme.breakpoints.down(700))
    const is600 = useMediaQuery(theme.breakpoints.down(600))
    const is500 = useMediaQuery(theme.breakpoints.down(500))
    const is488 = useMediaQuery(theme.breakpoints.down(488))

    const brands = useSelector(selectBrands)
    const categories = useSelector(selectCategories)
    const products = useSelector(selectProducts)
    const totalResults = useSelector(selectProductTotalResults)
    const loggedInUser = useSelector(selectLoggedInUser)

    const productFetchStatus = useSelector(selectProductFetchStatus)

    const wishlistItems = useSelector(selectWishlistItems)
    const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus)
    const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus)

    const cartItemAddStatus = useSelector(selectCartItemAddStatus)

    const isProductFilterOpen = useSelector(selectProductIsFilterOpen)

    const dispatch = useDispatch()

    const handleBrandFilters = (e) => {
        const filterSet = new Set(filters.brand)
        if (e.target.checked) { filterSet.add(e.target.value) }
        else { filterSet.delete(e.target.value) }

        const filterArray = Array.from(filterSet);
        setFilters({ ...filters, brand: filterArray })
    }

    const handleCategoryFilters = (e) => {
        const filterSet = new Set(filters.category)
        if (e.target.checked) { filterSet.add(e.target.value) }
        else { filterSet.delete(e.target.value) }

        const filterArray = Array.from(filterSet);
        setFilters({ ...filters, category: filterArray })
    }

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant"
        })
    }, [])

    useEffect(() => {
        setPage(1)
    }, [totalResults])

    useEffect(() => {
        const finalFilters = { ...filters }

        finalFilters['pagination'] = { page: page, limit: ITEMS_PER_PAGE }
        finalFilters['sort'] = sort

        if (keyword) {
            finalFilters['search'] = keyword;
        }

        if (!loggedInUser?.isAdmin) {
            finalFilters['user'] = true
        }

        dispatch(fetchProductsAsync(finalFilters))

    }, [filters, page, sort, keyword])


    const handleAddRemoveFromWishlist = (e, productId) => {
        if (e.target.checked) {
            const data = { user: loggedInUser?._id, product: productId }
            dispatch(createWishlistItemAsync(data))
        }

        else if (!e.target.checked) {
            const index = wishlistItems.findIndex((item) => item.product._id === productId)
            dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
        }
    }

    useEffect(() => {
        if (wishlistItemAddStatus === 'fulfilled') {
            toast.success("Sản phẩm được thêm vào yêu thích")
        }
        else if (wishlistItemAddStatus === 'rejected') {
            toast.error("Lỗi khi thêm sản phẩm vào danh sách yêu thích, vui lòng thử lại sau.")
        }

    }, [wishlistItemAddStatus])

    useEffect(() => {
        if (wishlistItemDeleteStatus === 'fulfilled') {
            toast.success("Sản phẩm đã bị xóa khỏi danh sách yêu thích")
        }
        else if (wishlistItemDeleteStatus === 'rejected') {
            toast.error("Lỗi khi xóa sản phẩm khỏi danh sách yêu thích, vui lòng thử lại sau.")
        }
    }, [wishlistItemDeleteStatus])

    useEffect(() => {
        if (cartItemAddStatus === 'fulfilled') {
            toast.success("Sản phẩm được thêm vào giỏ")
        }
        else if (cartItemAddStatus === 'rejected') {
            toast.error("Lỗi khi thêm sản phẩm vào giỏ hàng, vui lòng thử lại sau.")
        }

    }, [cartItemAddStatus])

    useEffect(() => {
        if (productFetchStatus === 'rejected') {
            toast.error("Không thể tải sản phẩm, vui lòng thử lại sau.")
        }
    }, [productFetchStatus])

    useEffect(() => {
        return () => {
            dispatch(resetProductFetchStatus())
            dispatch(resetWishlistItemAddStatus())
            dispatch(resetWishlistItemDeleteStatus())
            dispatch(resetCartItemAddStatus())
        }
    }, [])

    const handleFilterClose = () => {
        dispatch(toggleFilters())
    }

    const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

    return (
        <>
            <motion.div 
                style={{ 
                    position: "fixed", 
                    backgroundColor: "white", 
                    height: "100vh", 
                    padding: '1rem', 
                    overflowY: "auto", 
                    width: is500 ? "100vw" : "30rem", 
                    zIndex: 9999, 
                    top: 0 
                }} 
                variants={{ show: { left: 0 }, hide: { left: is500 ? "-100vw" : "-30rem" } }} 
                initial={'hide'} 
                transition={{ ease: "easeInOut", duration: 0.4 }} 
                animate={isProductFilterOpen ? "show" : "hide"}
            >
                <Stack mb={'5rem'} sx={{ scrollBehavior: "smooth" }}>
                    <Typography variant='h4'>Bộ lọc sản phẩm</Typography>
                    <IconButton onClick={handleFilterClose} style={{ position: "absolute", top: 15, right: 15 }}>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <ClearIcon fontSize='medium' />
                        </motion.div>
                    </IconButton>
                    
                    <Stack mt={2}>
                        <Accordion>
                            <AccordionSummary expandIcon={<AddIcon />} aria-controls="brand-filters" id="brand-filters">
                                <Typography>Thương hiệu</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                <FormGroup onChange={handleBrandFilters}>
                                    {brands?.map((brand) => (
                                        <motion.div style={{ width: "fit-content" }} whileHover={{ x: 5 }} whileTap={{ scale: 0.9 }} key={brand._id}>
                                            <FormControlLabel sx={{ ml: 1 }} control={<Checkbox checked={filters.brand?.includes(brand._id) || false} />} label={brand.name} value={brand._id} />
                                        </motion.div>
                                    ))}
                                </FormGroup>
                            </AccordionDetails>
                        </Accordion>
                    </Stack>

                    <Stack mt={2}>
                        <Accordion>
                            <AccordionSummary expandIcon={<AddIcon />} aria-controls="category-filters" id="category-filters">
                                <Typography>Phân loại sản phẩm</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                <FormGroup onChange={handleCategoryFilters}>
                                    {categories?.map((category) => (
                                        <motion.div style={{ width: "fit-content" }} whileHover={{ x: 5 }} whileTap={{ scale: 0.9 }} key={category._id}>
                                            <FormControlLabel sx={{ ml: 1 }} control={<Checkbox checked={filters.category?.includes(category._id) || false} />} label={category.name} value={category._id} />
                                        </motion.div>
                                    ))}
                                </FormGroup>
                            </AccordionDetails>
                        </Accordion>
                    </Stack>
                </Stack>
            </motion.div>

            {productFetchStatus === 'pending' ? (
                <Stack width={'100%'} height={'80vh'} justifyContent={'center'} alignItems={'center'}>
                    <Lottie animationData={loadingAnimation} style={{ width: '200px' }} />
                </Stack>
            ) : (
                <Stack mb={'3rem'}>
                    {!is600 && (
                        <Stack sx={{ width: "100%", height: is800 ? "300px" : is1200 ? "400px" : "500px" }}>
                            <ProductBanner images={bannerImages} />
                        </Stack>
                    )}

                    <Stack rowGap={5} mt={is600 ? 2 : 0}>
                        <Stack flexDirection={'row'} mr={'2rem'} justifyContent={'flex-end'} alignItems={'center'} columnGap={5}>
                            <Stack alignSelf={'flex-end'} width={'12rem'}>
                                <FormControl fullWidth>
                                    <InputLabel id="sort-dropdown">Sắp xếp theo thứ tự</InputLabel>
                                    <Select
                                        variant='standard'
                                        labelId="sort-dropdown"
                                        label="Sort"
                                        onChange={(e) => setSort(e.target.value)}
                                        value={sort || ""}
                                    >
                                        <MenuItem value={null}>Reset</MenuItem>
                                        {sortOptions.map((option) => (
                                            <MenuItem key={option.name} value={option}>{option.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Stack>

                        {products.length === 0 ? (
                            <Stack width="100%" alignItems="center" mt={5}>
                                <Typography variant="h5" color="text.secondary">
                                    Không có sản phẩm phù hợp
                                </Typography>
                            </Stack>
                        ) : (
                            <Grid container spacing={3} sx={{ padding: '0 1rem' }}>
                                {products.map((product) => (
                                    <Grid item sm={6} md={4} lg={3} xl={3} key={product._id} sx={{ display: 'flex' }}>
                                        <ProductCard
                                            id={product._id}
                                            title={product.title}
                                            thumbnail={product.thumbnail}
                                            brand={product.brand}
                                            price={product.price}
                                            stockQuantity={product.stockQuantity}
                                            tags={product.tags}
                                            handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        <Stack
                            alignSelf={is488 ? 'center' : 'flex-end'}
                            mr={is488 ? 0 : 5}
                            rowGap={2}
                            p={is488 ? 1 : 0}
                        >
                            <Pagination
                                size={is488 ? 'medium' : 'large'}
                                page={page}
                                onChange={(e, page) => setPage(page)}
                                count={totalPages}
                                variant="outlined"
                                shape="rounded"
                                renderItem={(item) => {
                                    if (totalPages <= 3) return <PaginationItem {...item} />;

                                    let startPage = page >= 4 ? page - 2 : 1;
                                    let endPage = startPage + 2;

                                    if (endPage >= totalPages) {
                                        endPage = totalPages - 1;
                                        startPage = Math.max(1, endPage - 2);
                                    }

                                    const allowedPages = [];
                                    for (let i = startPage; i <= endPage; i++) {
                                        allowedPages.push(i);
                                    }
                                    allowedPages.push(totalPages);

                                    if (item.type === 'page' && !allowedPages.includes(item.page)) {
                                        if (item.page === endPage + 1 && endPage + 1 < totalPages) {
                                            return <PaginationItem {...item} page="..." disabled />;
                                        }
                                        return null;
                                    }

                                    return <PaginationItem {...item} />;
                                }}
                            />
                            <Typography textAlign="center">
                                Trang {page} có{" "}
                                {Math.min(
                                    ITEMS_PER_PAGE,
                                    totalResults - (page - 1) * ITEMS_PER_PAGE
                                )} sản phẩm
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
            )}
        </>
    )
}