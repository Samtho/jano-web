# Arquitectura de Jano 2.0 · diagramas de flujo

Jano adapta un CV a una oferta **sin inventar nada**. La web ([jano-web](https://samtho.github.io/jano-web/)) es 100% estática: todo el motor vive en **flujos de n8n** sobre **Supabase pgvector**. Este documento describe la lógica de cada proceso (los diagramas se renderizan en GitHub automáticamente).

## Vista general

```mermaid
flowchart LR
    U[Usuario] --> W[jano-web<br/>Next.js estatico en GitHub Pages]
    W -->|fetch JSON| N[n8n cloud<br/>6 flujos v2]
    N -->|SQL + Vector Store| S[(Supabase<br/>pgvector)]
    N -->|gpt-4o-mini +<br/>text-embedding-3-small| O[OpenAI API]
```

La web no tiene servidor propio: cada acción del usuario llama a un webhook de n8n con CORS abierto. Cada visitante tiene un `cvId` propio (UUID en localStorage), así varios usuarios conviven sin pisarse.

## 1. Ingesta del CV

```mermaid
flowchart LR
    A[Usuario sube PDF / DOCX / TXT<br/>o pega texto] --> B[Parser en el navegador<br/>pdfjs / mammoth]
    B --> C[POST v2-ingest-cv<br/>cvId + textoCV]
    C --> D[LLM extrae hechos<br/>texto + origen + categoria]
    D --> E[Embeddings OpenAI<br/>1536 dims]
    E --> F[(Supabase documents<br/>metadata: cvId, categoria, origen)]
    G{{GUARDARRAIL: solo entra<br/>lo que esta en el CV}} -.- D
```

Notas:
- El archivo **nunca sale del navegador**: solo viaja el texto extraído.
- La ingesta es idempotente por `cvId` (borra los hechos previos de ese CV antes de insertar).

## 2. Match con la oferta

```mermaid
flowchart LR
    A[Oferta pegada<br/>o traida de URL] --> B[POST v2-match-oferta]
    B --> C[LLM extrae requisitos<br/>y los clasifica por categoria]
    C --> D[Por requisito:<br/>busqueda vectorial topK=1<br/>filtrada por cvId]
    D --> E{similitud >= 0.4?}
    E -->|si| F[cubre]
    E -->|no| G[noCubre]
    F --> H[Score ponderado por categoria<br/>exp 30 · hab 30 · perfil 20 · idiomas 10 · otros 10]
    G --> H
    H --> I[matchScore 0-100<br/>+ desglose porCategoria]
    J{{GUARDARRAIL: sin hecho que lo respalde,<br/>un requisito NUNCA se da por cubierto}} -.- E
```

El umbral 0.4 es **matemático** (similitud coseno), no una opinión del modelo: el LLM solo extrae y clasifica, el veredicto cubierto/no cubierto lo da la búsqueda vectorial.

## 3. Ciclo de huecos (la memoria del agente)

```mermaid
flowchart LR
    A[noCubre del match] --> B[Una pregunta por requisito:<br/>tienes algo real que lo respalde?]
    B --> C{El usuario<br/>tiene la experiencia?}
    C -->|si, la escribe| D[POST v2-guardar-hueco]
    C -->|no| E[Se queda como hueco.<br/>Jano NO lo rellena]
    D --> F[(Nuevo hecho en documents<br/>origen: respuesta a hueco)]
    F --> G[Recalcular match]
    G --> H[El score sube en vivo]
```

Verificado en pruebas reales: un match de 43 subió a 86 tras responder un hueco de experiencia.

## 4. CV adaptado (generativo con cita)

```mermaid
flowchart LR
    A[POST v2-cv-adaptado<br/>cvId + oferta] --> B[(SELECT todos los hechos<br/>del cvId)]
    B --> C[AI Agent redacta el CV<br/>SOLO con esos hechos]
    C --> D[Structured Output:<br/>secciones y bullets]
    D --> E[Cada bullet lleva origen =<br/>el hecho literal que lo respalda]
    E --> F[La web permite auditar<br/>cada bullet con un clic]
    G{{GUARDARRAIL: puede reformular,<br/>no puede afirmar nada sin hecho}} -.- C
```

## 5. Tracker (cerrar el ciclo)

```mermaid
flowchart LR
    A[Marcar como enviada<br/>empresa + puesto] --> B[POST v2-postulaciones-alta]
    B --> C[(INSERT en postulaciones<br/>con el matchScore)]
    C --> D[GET v2-postulaciones]
    D --> E[Panel con KPIs en vivo:<br/>total, % respuesta, entrevistas, match medio]
    C -.la misma tabla.-> F[Capa C del equipo:<br/>dashboard y avisos]
```

Cero doble entrada: el alta es automática y el equipo (capa C) consume la misma tabla.

## Flujos n8n v2 (inventario)

| Flujo | Webhook | Entrada | Salida |
|---|---|---|---|
| v2 Ingesta CV | `POST /webhook/v2-ingest-cv` | `{cvId, textoCV}` | `{ok, guardados}` |
| v2 Match | `POST /webhook/v2-match-oferta` | `{cvId, oferta_texto}` | `{matchScore, porCategoria, cubre, noCubre}` |
| v2 Guardar hueco | `POST /webhook/v2-guardar-hueco` | `{cvId, requisito, respuesta}` | `{ok}` |
| v2 CV adaptado | `POST /webhook/v2-cv-adaptado` | `{cvId, oferta_texto}` | `{secciones[]}` |
| v2 Oferta desde URL | `POST /webhook/v2-oferta-url` | `{url}` | `{oferta_texto}` |
| v2 Postulaciones | `GET /webhook/v2-postulaciones` · `POST /webhook/v2-postulaciones-alta` | `{empresa, puesto, ...}` | lista · `{ok, id}` |

Los flujos v1 del PoC original siguen activos e intactos: v1 y v2 conviven (demo "antes y después").

## Límites conocidos (v2, honestos)

- Sin OCR: un PDF escaneado pide pegar el texto a mano.
- Ofertas por URL: LinkedIn suele bloquear la lectura anónima (fallback: pegar el texto). Portales públicos funcionan.
- Identidad por navegador (UUID), sin login.
- La descarga .docx ATS es de la capa C; la web ofrece imprimir / guardar PDF.
