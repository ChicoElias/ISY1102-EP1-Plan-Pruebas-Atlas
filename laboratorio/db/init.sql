-- ============================================================
--  ATLAS (réplica de laboratorio ISY1102)  ·  esquema + semilla
--  Modelo multiempresa conforme a la ERS v1.1 del caso
-- ============================================================

CREATE TABLE empresas (
    id      INTEGER PRIMARY KEY,
    nombre  TEXT NOT NULL,
    rut     TEXT NOT NULL
);

CREATE TABLE usuarios (
    id            SERIAL PRIMARY KEY,
    empresa_id    INTEGER NOT NULL REFERENCES empresas(id),
    usuario       TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol           TEXT NOT NULL CHECK (rol IN ('admin','editor'))
);

CREATE TABLE clientes (
    id             SERIAL PRIMARY KEY,
    empresa_id     INTEGER NOT NULL REFERENCES empresas(id),
    razon_social   TEXT NOT NULL,
    rut            TEXT,
    telefono       TEXT,
    descripcion    TEXT,
    cuenta_bancaria TEXT,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contratos (
    id            SERIAL PRIMARY KEY,
    empresa_id    INTEGER NOT NULL REFERENCES empresas(id),
    cliente_id    INTEGER NOT NULL REFERENCES clientes(id),
    fecha_inicio  DATE,
    fecha_termino DATE,
    estado        TEXT NOT NULL DEFAULT 'vigente',
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------- Empresas (dos tenants) --------
INSERT INTO empresas (id, nombre, rut) VALUES
    (101, 'Comercializadora Pyme Uno SpA', '76.111.111-1'),
    (102, 'Distribuidora Pyme Dos Ltda',   '77.222.222-2');

-- -------- Usuarios (hash bcrypt lo inserta la API al iniciar) --------

-- -------- Clientes --------
-- Empresa A (101): cliente propio, usado en pruebas de rol y validación.
INSERT INTO clientes (id, empresa_id, razon_social, rut, telefono, descripcion, cuenta_bancaria) VALUES
    (101, 101, 'Comercial Los Andes SpA', '78.333.444-5', '+56 9 5555 1010', 'Cliente vigente', 'BANCO-CL 000-11-22222-3');
-- Empresa B (102): cliente objetivo del test IDOR (datos personales y bancarios de un tercero).
INSERT INTO clientes (id, empresa_id, razon_social, rut, telefono, descripcion, cuenta_bancaria) VALUES
    (5530, 102, 'Distribuidora del Sur Ltda', '61.444.555-6', '+56 9 7777 3030', 'Cliente empresa B', 'BANCO-CL 999-88-77777-6');
SELECT setval('clientes_id_seq', 6000, true);

-- -------- Contratos --------
INSERT INTO contratos (id, empresa_id, cliente_id, fecha_inicio, fecha_termino) VALUES
    (9001, 101, 101,  '2026-01-01', '2026-12-31'),
    (7700, 102, 5530, '2026-01-01', '2026-12-31');   -- contrato de la empresa B (objetivo IDOR)
SELECT setval('contratos_id_seq', 9100, true);
