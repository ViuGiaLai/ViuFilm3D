"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  ExternalLink,
  Filter,
  LayoutGrid,
  List,
  Pencil,
  PlusCircle,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { MovieArt } from "@/components/ui/movie-art";
import {
  formatCompactNumber as compact,
  formatMovieBadge,
  toSlug,
} from "@/lib/format";
import { genres, type Movie } from "@/lib/movies";
import type { EditMovie, PatchMovie } from "@/components/admin/types";

type AdminMoviesProps = {
  movies: Movie[];
  edit: EditMovie;
  remove: (id: number) => Promise<void>;
  removeMany: (ids: number[]) => Promise<void>;
  duplicate: (movie: Movie) => Promise<void>;
  patchMovie: PatchMovie;
  pageSize: number;
};

export default function AdminMovies({
  movies,
  edit,
  remove,
  removeMany,
  duplicate,
  patchMovie,
  pageSize,
}: AdminMoviesProps) {
  const [keyword, setKeyword] = useState("");
  const [format, setFormat] = useState("Tất cả");
  const [status, setStatus] = useState("Tất cả");
  const [genre, setGenre] = useState("Tất cả");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const filteredList = movies
    .filter((movie: Movie) => {
      const target =
        `${movie.title} ${movie.originalTitle} ${movie.studio}`.toLowerCase();
      const matchFormat =
        format === "Tất cả" ||
        (format === "Phim bộ"
          ? movie.totalEpisodes > 1
          : movie.totalEpisodes <= 1);
      return (
        target.includes(keyword.trim().toLowerCase()) &&
        matchFormat &&
        (status === "Tất cả" || movie.status === status) &&
        (genre === "Tất cả" || movie.genres.includes(genre))
      );
    })
    .sort((a: Movie, b: Movie) => {
      if (sort === "views") return b.views - a.views;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "title") return a.title.localeCompare(b.title, "vi");
      return b.id - a.id;
    });

  const effectivePageSize = viewMode === "grid" ? 18 : pageSize;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredList.length / effectivePageSize),
  );
  const safePage = Math.min(page, totalPages);
  const list = filteredList.slice(
    (safePage - 1) * effectivePageSize,
    safePage * effectivePageSize,
  );
  const currentPageIds = list.map((movie: Movie) => movie.id);
  const allCurrentSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id: number) => selected.includes(id));

  useEffect(
    () => setPage(1),
    [keyword, format, status, genre, sort, effectivePageSize, viewMode],
  );

  const toggleAll = () => {
    setSelected((current) =>
      allCurrentSelected
        ? current.filter((id) => !currentPageIds.includes(id))
        : [...new Set([...current, ...currentPageIds])],
    );
  };

  const toggle = (id: number) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleIncrementEpisode = async (movie: Movie) => {
    if (movie.totalEpisodes > 1 && movie.episode < movie.totalEpisodes) {
      const nextEp = movie.episode + 1;
      await patchMovie(movie.id, {
        episode: nextEp,
        status: nextEp >= movie.totalEpisodes ? "Hoàn thành" : "Đang chiếu",
      });
    }
  };

  const handleToggleFeatured = async (movie: Movie) => {
    await patchMovie(movie.id, {
      featured: !movie.featured,
    });
  };

  return (
    <section className="admin-library">
      <div className="admin-toolbar">
        <div className="catalog-search">
          <Search />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm tên phim, diễn viên, xưởng sản xuất..."
          />
        </div>

        <div className="admin-filters">
          <div className="admin-view-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Xem dạng danh sách bảng"
              aria-label="Xem dạng bảng"
            >
              <List size={15} />
              <span>Bảng</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Xem dạng lưới Poster phim"
              aria-label="Xem dạng lưới Poster"
            >
              <LayoutGrid size={15} />
              <span>Poster</span>
            </button>
          </div>

          <select
            value={format}
            onChange={(event) => setFormat(event.target.value)}
          >
            <option value="Tất cả">Tất cả định dạng</option>
            <option value="Phim bộ">Phim bộ (Series)</option>
            <option value="Phim lẻ">Phim lẻ (Bản Full)</option>
          </select>
          <label>
            <Filter />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              <option>Đang chiếu</option>
              <option>Hoàn thành</option>
              <option>Sắp chiếu</option>
            </select>
          </label>
          <select
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          >
            {genres.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Mới thêm</option>
            <option value="views">Nhiều lượt xem</option>
            <option value="rating">Điểm cao nhất</option>
            <option value="title">Tên A–Z</option>
          </select>
        </div>
      </div>

      <div className="admin-bulkbar">
        <span>
          <b>{filteredList.length}</b> phim · <b>{selected.length}</b> đã chọn
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            className="danger-action"
            onClick={() => {
              removeMany(selected);
              setSelected([]);
            }}
          >
            <Trash2 size={14} /> Xóa {selected.length} phim đã chọn
          </button>
        )}
      </div>

      {viewMode === "table" ? (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={toggleAll}
                    aria-label="Chọn tất cả"
                  />
                </th>
                <th>Phim</th>
                <th>Thông số</th>
                <th>Tiến độ tập</th>
                <th>Lịch chiếu</th>
                <th>Trạng thái & Ghim</th>
                <th>Hiệu suất</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((movie: Movie) => (
                <tr key={movie.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(movie.id)}
                      onChange={() => toggle(movie.id)}
                      aria-label={`Chọn ${movie.title}`}
                    />
                  </td>
                  <td>
                    <MovieArt movie={movie} />
                    <span>
                      <b>{movie.title}</b>
                      <small>{movie.originalTitle}</small>
                      <em>{movie.genres.join(" · ")}</em>
                    </span>
                  </td>
                  <td>
                    <b>
                      {movie.year} · {movie.quality}
                    </b>
                    <small>
                      {movie.studio}
                      <br />
                      {movie.duration}{" "}
                      {movie.totalEpisodes <= 1 ? "phút (Full)" : "phút/tập"}
                    </small>
                  </td>
                  <td>
                    <div className="episode-control-cell">
                      <b>
                        {movie.totalEpisodes <= 1
                          ? "Bản Full"
                          : formatMovieBadge(movie).replace(/^Tập\s+/i, "")}
                      </b>
                      {movie.totalEpisodes > 1 &&
                        movie.episode < movie.totalEpisodes && (
                          <button
                            type="button"
                            className="quick-ep-btn"
                            onClick={() => handleIncrementEpisode(movie)}
                            title={`Tăng lên tập ${movie.episode + 1}`}
                          >
                            +1 Tập
                          </button>
                        )}
                    </div>
                    <div className="table-progress">
                      <i
                        style={{
                          width: `${movie.totalEpisodes <= 1 ? 100 : (movie.episode / movie.totalEpisodes) * 100}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <b>
                      {movie.totalEpisodes <= 1 ? "Trọn bộ" : movie.updateDay}
                    </b>
                    <small>
                      {movie.totalEpisodes <= 1
                        ? "Phim lẻ / Thuyết minh"
                        : movie.status === "Đang chiếu"
                          ? "Cập nhật hàng tuần"
                          : "Không có lịch mới"}
                    </small>
                  </td>
                  <td>
                    <div className="status-cell-wrap">
                      <button
                        type="button"
                        className={`status-pill status-${toSlug(movie.status)}`}
                        onClick={() =>
                          patchMovie(movie.id, {
                            status:
                              movie.status === "Đang chiếu"
                                ? "Hoàn thành"
                                : "Đang chiếu",
                          })
                        }
                        title="Click để chuyển trạng thái"
                      >
                        {movie.status}
                      </button>

                      <button
                        type="button"
                        className={`featured-star-toggle ${movie.featured ? "active" : ""}`}
                        onClick={() => handleToggleFeatured(movie)}
                        title={
                          movie.featured
                            ? "Đang ghim trang chủ. Click để bỏ ghim"
                            : "Click để ghim phim lên trang chủ"
                        }
                      >
                        <Star size={13} fill={movie.featured ? "#f59e0b" : "none"} />
                        <span>{movie.featured ? "Nổi bật" : "Ghim"}</span>
                      </button>
                    </div>
                  </td>
                  <td>
                    <b>{compact(movie.views)} lượt</b>
                    <small>
                      <Star size={11} fill="#eab308" color="#eab308" />{" "}
                      {movie.rating.toFixed(1)} điểm
                    </small>
                  </td>
                  <td>
                    <div className="table-row-actions">
                      <a
                        href={`/phim/${movie.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="table-action-icon"
                        title="Xem trang phim trên website"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <button
                        type="button"
                        className="table-action-icon"
                        title="Nhân bản phim"
                        onClick={() => duplicate(movie)}
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        type="button"
                        className="table-action-icon"
                        title="Chỉnh sửa thông tin phim"
                        onClick={() => edit(movie)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        title="Xóa phim khỏi kho"
                        className="table-action-icon delete-icon"
                        onClick={() => remove(movie.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && (
            <div className="admin-empty">
              <Search />
              <b>Không tìm thấy phim phù hợp</b>
              <span>Hãy thay đổi từ khóa hoặc bộ lọc.</span>
            </div>
          )}
        </div>
      ) : (
        /* Grid Poster View */
        <div className="admin-poster-grid">
          {list.map((movie: Movie) => (
            <article className="poster-card-item" key={movie.id}>
              <div className="poster-thumb-wrap">
                <MovieArt movie={movie} />

                {/* Top overlays: 4K tag, Select Checkbox, Featured Star */}
                <div className="poster-top-bar">
                  <input
                    type="checkbox"
                    className="poster-select-chk"
                    checked={selected.includes(movie.id)}
                    onChange={() => toggle(movie.id)}
                    aria-label={`Chọn ${movie.title}`}
                  />
                  <div className="poster-top-badges">
                    <span className="poster-quality-badge">{movie.quality}</span>
                    <button
                      type="button"
                      className={`poster-star-btn ${movie.featured ? "active" : ""}`}
                      onClick={() => handleToggleFeatured(movie)}
                      title={movie.featured ? "Đã ghim nổi bật" : "Ghim phim"}
                    >
                      <Star
                        size={13}
                        fill={movie.featured ? "#f59e0b" : "none"}
                        color={movie.featured ? "#f59e0b" : "#fff"}
                      />
                    </button>
                  </div>
                </div>

                {/* Episode indicator */}
                <div className="poster-bottom-badge">
                  <span className={`status-pill status-${toSlug(movie.status)}`}>
                    {movie.status}
                  </span>
                  <span className="ep-badge">
                    {movie.totalEpisodes <= 1
                      ? "Bản Full"
                      : `Tập ${movie.episode}/${movie.totalEpisodes}`}
                  </span>
                </div>

                {/* Hover Action Overlay */}
                <div className="poster-hover-actions">
                  {movie.totalEpisodes > 1 &&
                    movie.episode < movie.totalEpisodes && (
                      <button
                        type="button"
                        className="hover-action-btn quick-plus-ep"
                        onClick={() => handleIncrementEpisode(movie)}
                        title={`Tăng lên tập ${movie.episode + 1}`}
                      >
                        <PlusCircle size={14} /> +1 Tập
                      </button>
                    )}
                  <button
                    type="button"
                    className="hover-action-btn"
                    onClick={() => edit(movie)}
                    title="Chỉnh sửa"
                  >
                    <Pencil size={14} /> Sửa
                  </button>
                  <a
                    href={`/phim/${movie.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover-action-btn"
                    title="Xem thử trang phim"
                  >
                    <ExternalLink size={14} /> Xem
                  </a>
                  <button
                    type="button"
                    className="hover-action-btn"
                    onClick={() => duplicate(movie)}
                    title="Nhân bản"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    className="hover-action-btn danger"
                    onClick={() => remove(movie.id)}
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="poster-card-body">
                <strong className="poster-card-title" title={movie.title}>
                  {movie.title}
                </strong>
                <span className="poster-card-studio">
                  {movie.year} · {movie.studio}
                </span>
                <div className="poster-card-metrics">
                  <span className="poster-rating">
                    <Star size={11} fill="#eab308" color="#eab308" />
                    {movie.rating.toFixed(1)}
                  </span>
                  <span className="poster-views">{compact(movie.views)} xem</span>
                </div>
              </div>
            </article>
          ))}

          {!list.length && (
            <div className="admin-empty full-span">
              <Search />
              <b>Không tìm thấy phim phù hợp</b>
              <span>Hãy thay đổi từ khóa hoặc bộ lọc.</span>
            </div>
          )}
        </div>
      )}

      {filteredList.length > effectivePageSize && (
        <div className="admin-pagination">
          <span>
            Trang {safePage}/{totalPages} · Hiển thị {list.length} /{" "}
            {filteredList.length} phim
          </span>
          <div>
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(Math.max(0, safePage - 3), safePage + 2)
              .map((item) => (
                <button
                  type="button"
                  key={item}
                  className={item === safePage ? "active" : ""}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ))}
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
