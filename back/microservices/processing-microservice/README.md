# Processing Microservice (Mikroservis Prerade Sirovina)

Mikroservis za preradu biljaka u parfeme sa automatskim balansiranjem aromatske jačine.

## 🚀 Pokretanje

### Preduslov
- Node.js v18+
- MySQL 8.0+
- npm ili yarn
- Plants mikroservis mora biti pokrenut (port 5003)

### Instalacija

```bash
# Instalacija dependencies
npm install

# Kopiraj .env.example u .env i konfiguriši
cp .env.example .env

# Kreiranje baze podataka
mysql -u root -p
CREATE DATABASE database_prerada;
```

### Pokretanje u development modu

```bash
npm run dev
```

Servis će biti dostupan na `http://localhost:5004`

## 📋 API Endpointi

Svi endpointi koriste prefix: `/api/v1`

### Prerada (Processing)

#### POST `/processing/start`
Pokreće proces prerade biljaka u parfeme.

**Request:**
```json
{
  "perfumeName": "Rose Elegance",
  "perfumeType": "parfem",
  "quantity": 3,
  "netVolume": 250,
  "plantCommonName": "Ruza"
}
```

**Response:**
```json
{
  "perfumes": [
    {
      "id": 1,
      "name": "Rose Elegance",
      "type": "parfem",
      "netVolume": 250,
      "serialNumber": "PP-2026-1",
      "plantId": 5,
      "expirationDate": "2029-02-05",
      "createdAt": "2026-02-05T12:00:00.000Z"
    }
  ],
  "plantsUsed": 15,
  "message": "Uspešno prerađeno 3 parfema od 15 biljaka"
}
```

**Logika:**
- 1 biljka = 50ml parfema
- Ako `aromaStrength > 4.0`, kreira se nova biljka sa smanjenom jačinom za balansiranje
- Rok trajanja: 3 godine od datuma proizvodnje
- Serijski broj: `PP-{godina}-{id}`

### Parfemi (Perfumes)

#### GET `/perfumes`
Vraća sve parfeme.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Rose Elegance",
    "type": "parfem",
    "netVolume": 250,
    "serialNumber": "PP-2026-1",
    "plantId": 5,
    "expirationDate": "2029-02-05",
    "createdAt": "2026-02-05T12:00:00.000Z"
  }
]
```

#### GET `/perfumes/:id`
Vraća jedan parfem po ID-u.

#### GET `/perfumes/type/:type`
Vraća parfeme po tipu.

**Tipovi:**
- `parfem` - Parfem
- `kolonjska voda` - Kolonjska voda

## 🔄 Aroma Balansiranje

Kada biljka ima `aromaStrength > 4.0`, sistem automatski:

1. Računa prekoračenje: `excess = aromaStrength - 4.0`
2. Računa procenat: `excessPercentage = (excess / 4.0) * 100`
3. Kreira novu biljku istog tipa
4. Smanjuje jačinu nove biljke za `excessPercentage`

**Primer:**
- Biljka ID=10, aromaStrength=4.6
- Prekoračenje: 0.6
- Procenat: 15%
- Nova biljka: aromaStrength ≈ 3.4 (smanjena za 15%)

## 🗄️ Baza podataka

### Tabela: `perfumes`

| Kolona | Tip | Opis |
|--------|-----|------|
| id | INT | Primarni ključ |
| name | VARCHAR(255) | Naziv parfema |
| type | VARCHAR(50) | Tip: 'parfem', 'kolonjska voda' |
| netVolume | INT | Zapremina u ml (150 ili 250) |
| serialNumber | VARCHAR(50) | Serijski broj (PP-YYYY-ID) |
| plantId | INT | ID biljke od koje je napravljen |
| expirationDate | DATE | Rok trajanja (3 godine) |
| createdAt | TIMESTAMP | Datum proizvodnje |

## 🔧 Konfiguracija (.env)

```env
PORT=5004
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=database_prerada
PLANTS_SERVICE_URL=http://localhost:5003/api/v1
LOGGING_SERVICE_URL=http://localhost:5002/api/v1
CORS_ORIGIN=http://localhost:5000
```

## 🔗 Inter-service komunikacija

Processing mikroservis komunicira sa:

- **Plants mikroservis** (`PLANTS_SERVICE_URL`)
  - Berba biljaka: `POST /plants/harvest`
  - Kreiranje novih biljaka: `POST /plants`
  - Prilagođavanje arome: `PUT /plants/:id/adjust-aroma`
  - Označavanje kao prerađene: `POST /plants/mark-processed`

- **Logging mikroservis** (`LOGGING_SERVICE_URL`)
  - Slanje logova

## 📦 Tehnologije

- **Node.js** - Runtime environment
- **TypeScript** - Programming language
- **Express** - Web framework
- **TypeORM** - ORM za MySQL
- **MySQL** - Database
- **Axios** - HTTP client za inter-service komunikaciju
