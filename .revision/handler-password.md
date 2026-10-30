# Kenapa Forgot Password & Reset Password tidak berjalan dengan semestinya ?

```ts
const debug = await prisma.$queryRaw<
  { used_at: Date | null; expires_at: Date; db_now: Date }[]
>(
  Prisma.sql`
    SELECT used_at, expires_at, NOW() AS db_now
    FROM "password_reset_tokens"
    WHERE token_hash = ${tokenHash}
`,
);

console.log("reset debug:", {
  tokenPrefix: values.token.slice(0, 6),
  rows: debug,
});
```

dari debug itu terlihat bahwa `token-nya sudah dianggap kedaluwarsa oleh database sejak detik pertama dibuat, karena waktu kedaluwarsanya tersimpan bergeser 7 jam ke belakang.`

`expires_at: 03:00:54Z
db_now:     09:31:19Z`

Token baru dibuat sekitar 25 detik sebelum log itu, dengan masa berlaku 30 menit. Seharusnya expires_at sekitar 10:00:54Z, tapi yang tersimpan 03:00:54Z, selisih persis 7 jam. Itu sama dengan selisih WIB (UTC+7), jadi pola ini mengarah ke zona waktu.

Mekanismenya
Aplikasi menghitung Date.now() + 30 menit, lalu menyimpannya ke kolom timestamptz.
Nilai itu sampai ke Postgres dalam bentuk jam dinding UTC tanpa keterangan zona, yaitu 10:00:54.
Sesi Postgres-mu berzona waktu Asia/Jakarta, jadi 10:00:54 dibaca sebagai 10:00:54 WIB, yang sama dengan 03:00:54Z.
Saat reset, query WHERE expires_at > NOW() membandingkan 03:00 dengan 09:31, hasilnya selalu false.
Query UPDATE ... RETURNING tidak menemukan baris, claimed kosong, dan repository mengembalikan { status: false }.

Karena itu semua hal lain terlihat normal: forgot-password berhasil membuat token dan mengirim email, hash cocok, token belum terpakai (used_at: null), dan form mengirim data dengan benar. Yang gagal hanya satu perbandingan waktu. Itu juga kenapa log debug-nya penting: rows yang terisi dengan used_at: null langsung menyingkirkan dugaan soal token, hash, atau form.

Yang saya yakini dan yang saya simpulkan

Pergeseran 7 jam dan akibatnya pasti, itu terbaca langsung dari log. Lapisan mana yang menyebabkannya (zona waktu sesi database atau cara driver mengirim Date) saya simpulkan dari polanya, karena kamu tidak pernah menunjukkan hasil SHOW timezone. Fakta bahwa sekarang sudah jalan setelah perbaikan zona waktu dan penghitungan waktu di sisi database mendukung kesimpulan itu.

Bug lain yang ikut memperkeruh

Bug transaksi yang sudah kita perbaiki (return { status: false } tetap commit, sehingga token bisa terbakar) bukan penyebab utamanya, karena token-mu masih used_at: null. Tapi bug itu bisa membuat percobaan berulang terlihat gagal karena alasan berbeda.

Pelajaran yang berlaku umum

Jangan membandingkan waktu yang dihitung di aplikasi dengan NOW() milik database. Hitung kedua sisinya di satu tempat, idealnya database (NOW() + INTERVAL ...), atau pastikan keduanya UTC. Pola yang sama ada di tabel sessions, tetapi tidak terasa karena masa berlakunya 7 hari, sehingga pergeseran 7 jam tidak langsung terlihat.

untuk mengatasi ini, database perlu dirubah secara waktu menjadi UTC
prisma/migrations/20261030024018_set_database_timezone_utc/migration.sql
disini me-alter database menjadi UTC

- bun run db:migrate --create-only --name set_db_timezone_utc
- edit hasil migration menjadi UTC untuk db nya
- lalu jalankan migration baru dari yang udah dibuat
- bun run db:migrate

. Mengubahnya ke UTC tidak membuat database “sesuai dengan waktu Jakarta”. Tujuannya membuat database dan aplikasi memakai acuan yang sama, yaitu UTC. (karena waktu timezone db hcm_system itu Asia/Jakarta)

Kenapa UTC, bukan Asia/Jakarta

Kolom timestamptz selalu menyimpan satu titik waktu absolut di dalam Postgres, yang pada dasarnya UTC. Zona waktu sesi tidak mengubah apa yang tersimpan. Zona itu hanya menentukan dua hal:

cara Postgres membaca nilai waktu tanpa keterangan zona yang masuk (inilah yang bermasalah di kasusmu),
cara Postgres menampilkan waktu saat kamu SELECT lewat psql.

Prisma mengirim waktu sebagai jam dinding UTC tanpa keterangan zona. Saat sesi database berzona Asia/Jakarta, 10:00:54 yang sebenarnya UTC dibaca sebagai 10:00:54 WIB, dan terjadilah pergeseran 7 jam. Saat sesi berzona UTC, 10:00:54 dibaca apa adanya sebagai 10:00:54 UTC, dan tidak ada lagi yang bergeser.

Kalau database kamu set ke Asia/Jakarta, masalahnya justru tetap ada, karena aplikasi tetap mengirim UTC.

Lalu bagaimana menampilkan waktu WIB ke user?

Konversi ke WIB dilakukan di lapisan tampilan (UI), bukan di database. Data disimpan dan diproses dalam UTC, lalu diformat saat ditampilkan:

```ts
new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  dateStyle: "medium",
  timeStyle: "short",
}).format(date);
```

Contoh yang relevan di aplikasimu nanti: last_login_at, jadwal, atau tanggal cuti yang perlu tampil dalam WIB. Pola umum yang aman: simpan UTC, tampilkan lokal.

Satu hal yang perlu kamu waspadai

Setelah database di UTC, nilai yang kamu lihat langsung di psql atau Prisma Studio juga tampil dalam UTC, jadi tampak mundur 7 jam dari jam lokalmu. Itu normal dan bukan bug.
