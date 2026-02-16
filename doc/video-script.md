## Script Video Penjelasan Project System Management Armada

Halo semuanya, di video ini saya akan menjelaskan secara singkat tentang project **System Management Armada** yang dibangun dengan teknologi modern berbasis **Next.js** dan **React**.

### 1. Gambaran Umum Project

Project ini adalah sebuah dashboard untuk memantau armada kendaraan, yang terintegrasi dengan API MBTA (Massachusetts Bay Transportation Authority). Aplikasi ini menggunakan:

- **Next.js 16** dengan **App Router**
- **React 19** dan **TypeScript** dengan mode `strict`
- **TanStack React Query v5** untuk pengelolaan data server (fetching, caching, polling)
- **Tailwind CSS v4** dan komponen **shadcn/ui** untuk tampilan UI
- Beberapa library UI tambahan seperti `radix-ui` dan `@base-ui/react` untuk komponen-komponen interaktif

Struktur kodenya dipisah menjadi beberapa layer, seperti:

- `app/containers/` untuk container atau smart component yang meng-handle data fetching dan state
- `components/` untuk komponen presentational / UI
- `hooks/queries/` untuk custom hooks TanStack Query
- `lib/api/` untuk abstraction pemanggilan API

### 2. Metode Pengambilan Data (Data Fetching)

Untuk pengambilan data, project ini menerapkan pola **4 lapis**:

1. **Custom Hook (TanStack Query)**
   - Contohnya `useVehicles` dan `useVehicleById` yang ada di `hooks/queries/use-vehicles.ts`.
   - Hook ini menggunakan `useQuery` dari TanStack React Query.
   - Di sini didefinisikan `queryKey`, `queryFn`, dan `refetchInterval` untuk polling data berkala.

2. **Endpoint Layer**
   - Di bawah folder `lib/api/endpoints/`, misalnya `vehicleApi`.
   - Di sini didefinisikan fungsi seperti `vehicleApi.getAll` dan `vehicleApi.getById` yang menyusun URL dan query parameter (limit, offset, filter route/trip, include relasi, dan sebagainya).

3. **API Client**
   - Di `lib/api/client.ts` ada fungsi generik `apiClient<T>`.
   - Fungsi ini selalu mengirim request ke path `/api/mbta/...` dan menambahkan header `Content-Type: application/json`.
   - Jika response tidak `ok`, dia akan `throw new Error(res.statusText)`, dan jika sukses, hasilnya di-`return` sebagai `res.json()`.

4. **API Proxy Next.js**
   - Di folder `app/api/mbta/[...path]/` ada route Next.js yang berfungsi sebagai **proxy** ke API MBTA.
   - Di sini API key dan base URL MBTA dibaca dari environment variable (`MBTA_API_URL` dan `MBTA_API_KEY`) sehingga key tidak pernah terekspos ke client.

Secara singkat, alurnya seperti ini:

> Component → custom hook `useVehicles` → `vehicleApi.getAll` → `apiClient` → `/api/mbta/...` → MBTA API

Kelebihan pendekatan ini:

- Data fetching terpusat dan konsisten.
- React Query meng-handle caching, loading state, error state, dan polling otomatis.
- API key aman karena hanya digunakan di sisi server (API route Next.js).

### 3. Teknologi untuk UI

Untuk tampilan antarmuka (UI), project ini menggabungkan beberapa teknologi:

- **Tailwind CSS v4**: digunakan untuk styling utilitas seperti layout grid, spacing, warna, dan responsivitas.
- **shadcn/ui**: kumpulan komponen UI siap pakai berbasis Radix yang sudah di-setup, misalnya:
  - `Card`, `Dialog`, `Select`, `Pagination`, `Skeleton`, dan lain-lain.
- **Utility `cn()`** dari `@/lib/utils`: untuk menggabungkan className Tailwind secara kondisional.

Contohnya pada komponen pagination (`components/ListPagination.tsx`):

- Menggunakan `Field`, `Select`, `Pagination`, `PaginationLink`, `PaginationNext`, `PaginationPrevious` dari shadcn/ui.
- Stylingnya memanfaatkan class Tailwind seperti `flex`, `grid`, `gap-4`, `rounded-xl`, `border`, dan sebagainya.

Hasilnya, UI terlihat modern, konsisten, dan mudah di-maintain karena komponen-komponen UI sudah terstruktur dengan baik.

### 4. Pagination: Cara Kerja dan Tools yang Digunakan

Pagination di project ini menggabungkan:

- **Perhitungan data dan page** di container
- **Komponen UI pagination** khusus untuk tampilan

#### a. Logika Pagination di Container

Logika dasarnya ada di `app/containers/VehicleList/index.tsx`:

- State `limitPerPage` dan `currentPage` disimpan di `useState`.
- Saat memanggil `useVehicles`, dikirim parameter:
  - `limit` = jumlah data per halaman
  - `offset` = `currentPage * limitPerPage`
  - `include` dan filter `route`/`trip` jika ada
- Dari response MBTA, project membaca:
  - `links.last` untuk mencari `offset` terakhir (menggunakan helper `parseOffsetFromUrl`).
  - Dari `lastOffset`, dihitung:
    - `totalItems`
    - `totalPages`
  - Lalu dibuat array nomor halaman dengan helper `generatePageNumbers(currentPage, totalPages)`.

Nilai-nilai ini (`totalItems`, `startItem`, `endItem`, `currentPage`, `pageNumbers`, `hasPrevPage`, `hasNextPage`) dikirim ke komponen `ListPagination`.

#### b. Komponen UI Pagination

Di `components/ListPagination.tsx`, UI pagination dibangun dengan:

- Komponen `Select` untuk memilih jumlah data per halaman (12, 24, 48, 96).
- Komponen `Pagination` dari shadcn/ui untuk:
  - Tombol previous/next (`PaginationPrevious`, `PaginationNext`)
  - Link nomor halaman (`PaginationLink`)
  - Tanda elipsis (`PaginationEllipsis`) jika halaman terlalu banyak.

Komponen ini hanya fokus ke tampilan dan event handler:

- Ketika user klik halaman, ia memanggil `onPageChange(page)`.
- Ketika user ubah limit, ia memanggil `onLimitChange(value)`.

Dengan pemisahan seperti ini:

- **Container** mengurus logika bisnis dan perhitungan pagination.
- **Komponen** mengurus tampilan dan interaksi UI.

### 5. Detail View dan Polling Data

Selain list kendaraan, project ini juga menyediakan **detail kendaraan**:

- Di container `VehicleList`, ketika user klik salah satu kartu kendaraan, state `selectedVehicle` akan di-set dan membuka `DialogDetail`.
- Custom hook `useVehicleById` akan melakukan fetch detail kendaraan berdasarkan `id`, dengan parameter `include=route,trip,stop`.
- `refetchInterval` untuk detail dibuat lebih sering (0.1 menit) agar informasi status kendaraan selalu up to date.
- Saat data sedang di-refresh, aplikasi menampilkan toast menggunakan `sonner` dengan pesan dalam bahasa Indonesia seperti:
  - “Memperbarui data kendaraan...”
  - “Data kendaraan berhasil diperbarui.”

### 6. Penutup (Closing Video)

Jadi, rangkuman singkatnya:

- **Framework & Tech Stack**: Next.js 16, React 19, TypeScript strict, React Query, Tailwind, shadcn/ui.
- **Metode Get Data**: Pola 4 lapis (custom hook → endpoint → apiClient → API proxy Next.js) dengan React Query untuk caching dan polling.
- **UI**: Menggunakan Tailwind CSS dan komponen siap pakai shadcn/ui untuk tampilan yang konsisten dan modern.
- **Pagination**: Menggabungkan perhitungan `limit`, `offset`, dan `links` dari API di container dengan komponen UI `ListPagination` yang dibuat di atas shadcn/ui.

Dengan arsitektur seperti ini, aplikasi jadi lebih mudah di-maintain, scalable, dan nyaman dikembangkan untuk fitur-fitur berikutnya.

Terima kasih sudah menonton, dan sampai jumpa di video berikutnya!

