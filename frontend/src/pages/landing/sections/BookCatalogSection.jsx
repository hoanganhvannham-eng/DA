import React from 'react'
import useBookList from '../../../features/book/hooks/useBookList'
import BookFilters from '../../../features/book/components/BookFilters'
import BookGrid from '../../../features/book/components/BookGrid'
import BookPagination from '../../../features/book/components/BookPagination'

/**
 * Section "Thư viện sách" hiển thị ngay trên trang chủ (khách chưa đăng nhập
 * vẫn xem được). Dùng chung logic/UI với BookListPage qua useBookList,
 * BookFilters, BookGrid, BookPagination — không có modal thêm/sửa/xóa.
 */
export default function BookCatalogSection() {
  const {
    books,
    categories,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    search,
    categoryFilter,
    sort,
    searchInput,
    setSearchInput,
    onSearchSubmit,
    onClearSearch,
    onCategoryChange,
    onSortChange,
    setPage,
    reload,
  } = useBookList()

  return (
   <section id="books" className="pt-32 pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 text-cyan-400 label-cyber mb-5">
            📚 Thư viện sách
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            Khám phá
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent"> kho sách</span> của chúng tôi
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Tìm kiếm, lọc theo thể loại và khám phá hàng trăm đầu sách đang có sẵn trong thư viện.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <BookFilters
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={onSearchSubmit}
            searchActive={!!search}
            onClearSearch={onClearSearch}
            categoryFilter={categoryFilter}
            categories={categories}
            onCategoryChange={onCategoryChange}
            sort={sort}
            onSortChange={onSortChange}
          />
        </div>

        {/* Book grid */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl p-6">
          <BookGrid
            books={books}
            loading={loading}
            error={error}
            onRetry={reload}
            emptyMessage={search || categoryFilter ? 'Không tìm thấy sách phù hợp.' : 'Chưa có sách nào trong hệ thống.'}
          />
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-6">
            <BookPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </section>
  )
}