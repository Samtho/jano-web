# Jano 2.0 · jano-web

**Tu CV, adaptado a cada oferta. Sin inventar nada.**

Web pública: **https://samtho.github.io/jano-web/**

Jano convierte un CV en una base de hechos auditable, calcula un match honesto contra cualquier oferta (RAG con embeddings sobre Supabase pgvector), pregunta solo los huecos reales y redacta un CV adaptado donde **cada bullet es trazable a su origen**.

## Qué hay aquí

| Ruta | Qué es |
|---|---|
| `/` | Landing |
| `/app` | Asistente de 5 pasos: CV → Oferta → Match → Huecos → CV adaptado |
| `/tracker` | Panel de postulaciones en vivo (KPIs + tabla) |
| `/como-funciona` | La arquitectura explicada de forma visual |
| [`docs/arquitectura.md`](docs/arquitectura.md) | Diagramas de flujo (Mermaid) de los 5 procesos |

## Arquitectura

- **Frontend**: Next.js 16 (App Router, export estático) + Tailwind v4, desplegado en GitHub Pages vía Actions. Sin servidor propio.
- **Motor**: 6 flujos de n8n cloud (webhooks v2) sobre Supabase pgvector + OpenAI (gpt-4o-mini + text-embedding-3-small).
- **Parsing de archivos**: el PDF/DOCX se lee **en el navegador** (pdfjs / mammoth); al motor solo viaja texto.
- **Identidad**: cada visitante recibe un `cvId` (UUID) en localStorage; varios usuarios conviven sin pisarse.

```
Usuario → jano-web (estatico) → webhooks n8n v2 → Supabase pgvector + OpenAI
```

## Principios (reglas duras)

1. **Guardarraíl anti-invención**: un requisito solo cuenta como cubierto si un hecho real lo respalda con similitud >= 0.4. El veredicto es matemático, no opinión del modelo.
2. **Trazabilidad por bullet**: cada línea del CV adaptado cita el hecho literal del que sale.
3. **Memoria que crece**: cada hueco respondido se guarda como hecho nuevo; el siguiente match lo aprovecha.

## Guion de demo (antes / después)

1. **Antes (v1)**: abrir el PoC original (`poc.html` del repo jano-app): mismo motor, interfaz de prototipo.
2. **Después (v2, esta web)**:
   - Subir un CV en PDF en `/app` (el texto se extrae en el navegador y se revisa).
   - Pegar una oferta real (o probar el enlace) → match en ~10s con desglose por categorías.
   - Responder un hueco → **Recalcular** → el score sube en vivo.
   - Generar el CV adaptado → clic en un bullet → se audita su origen.
   - "Marcar como enviada" → abrir `/tracker`: la fila está, con KPIs en vivo.
3. Cerrar con `/como-funciona` o [docs/arquitectura.md](docs/arquitectura.md) para la parte técnica.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000/jano-web
npm run build    # export estatico a ./out
```

El deploy es automático: cada push a `main` publica en GitHub Pages.

## Límites conocidos (v2)

- Sin OCR: un PDF escaneado pide pegar el texto a mano.
- LinkedIn bloquea la lectura anónima de ofertas por URL (fallback: pegar el texto).
- Identidad por navegador, sin login.
- La exportación .docx ATS pertenece a la capa C del equipo; aquí hay imprimir / PDF.

---

TFM · Master in Business Analytics & AI · Inesdi · 2026. Proyecto en equipo de 3 capas: A (motor IA + guardarraíl), **B (agente RAG: este repo + flujos n8n)**, C (automatización + tracker + avisos).
