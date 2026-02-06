# Plants Microservice (Mikroservis Proizvodnje)

Mikroservis za upravljanje proizvodnjom biljaka i praćenje njihovih aromatskih svojstava.

## 🚀 Pokretanje

### Preduslov
- Node.js v18+
- MySQL 8.0+
- npm ili yarn

### Instalacija

```bash
# Instalacija dependencies
npm install

# Kopiraj .env.example u .env i konfiguriši
cp .env.example .env

# Kreiranje baze podataka
mysql -u root -p
CREATE DATABASE database_proizvodnja;
```

### Pokretanje u development modu

```bash
npm run dev
```

Servis će biti dostupan na `http://localhost:5003`

## 📋 API Endpointi

Svi endpointi koriste prefix: `/api/v1`

### Biljke (Plants)

#### GET `/plants`
Vraća sve biljke.

**Response:**
```json
[
  {
    "id": 1,
    "commonName": "Ruza",
    "latinName": "Rosa damascena",
    "countryOfOrigin": "Bugarska",
    "aromaStrength": 4.2,
    "status": "posadjena",
    "createdAt": "2026-02-05T10:30:00.000Z"
  }
]
```

#### GET `/plants/:id`
Vraća jednu biljku po ID-u.

#### POST `/plants`
Kreira novu biljku.

**Request:**
```json
{
  "commonName": "Lavanda",
  "latinName": "Lavandula angustifolia",
  "countryOfOrigin": "Francuska",
  "aromaStrength": 3.5
}
```

**Response:**
```json
{
  "id": 2,
  "commonName": "Lavanda",
  "latinName": "Lavandula angustifolia",
  "countryOfOrigin": "Francuska",
  "aromaStrength": 3.5,
  "status": "posadjena",
  "createdAt": "2026-02-05T11:00:00.000Z"
}
```

#### POST `/plants/harvest`
Ubira biljke za preradu.

**Request:**
```json
{
  "commonName": "Ruza",
  "quantity": 10
}
```

**Response:**
```json
[
  {
    "id": 1,
    "commonName": "Ruza",
    "status": "ubrana",
    ...
  }
]
```

#### PUT `/plants/:id/adjust-aroma`
Prilagođava jačinu arome biljke.

**Request:**
```json
{
  "percentageChange": -15.5
}
```

**Response:**
```json
{
  "id": 1,
  "aromaStrength": 3.5,
  ...
}
```

#### POST `/plants/mark-processed`
Označava biljke kao prerađene.

**Request:**
```json
{
  "plantIds": [1, 2, 3]
}
```

## 🗄️ Baza podataka

### Tabela: `plants`

| Kolona | Tip | Opis |
|--------|-----|------|
| id | INT | Primarni ključ |
| commonName | VARCHAR(255) | Narodni naziv |
| latinName | VARCHAR(255) | Latinski naziv |
| countryOfOrigin | VARCHAR(255) | Država porekla |
| aromaStrength | DECIMAL(3,2) | Jačina arome (1.0 - 5.0) |
| status | ENUM | Status: 'posadjena', 'ubrana', 'preradjena' |
| createdAt | TIMESTAMP | Datum kreiranja |

## 🔧 Konfiguracija (.env)

```env
PORT=5003
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=database_proizvodnja
LOGGING_SERVICE_URL=http://localhost:5002/api/v1
CORS_ORIGIN=http://localhost:5000
```

## 📦 Tehnologije

- **Node.js** - Runtime environment
- **TypeScript** - Programming language
- **Express** - Web framework
- **TypeORM** - ORM za MySQL
- **MySQL** - Database
- **Axios** - HTTP client
