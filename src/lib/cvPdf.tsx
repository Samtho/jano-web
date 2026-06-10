// Generador del PDF Harvard (clon de la plantilla CV-Harvard-Espanol).
// Se importa con dynamic import: @react-pdf/renderer pesa, y solo se carga
// cuando el usuario pulsa "Descargar PDF". Texto real (ATS-friendly).
import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { BloqueCv, ContactoCv, CvAdaptado, SeccionCv } from "@/lib/types";

const s = StyleSheet.create({
  page: {
    paddingTop: 46,
    paddingBottom: 46,
    paddingHorizontal: 52,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: "#000",
    lineHeight: 1.35,
  },
  nombre: { fontSize: 20, fontFamily: "Helvetica-Bold", textAlign: "center" },
  contacto: { fontSize: 10, textAlign: "center", marginTop: 5 },
  regla: { borderBottomWidth: 1.6, borderBottomColor: "#000", marginTop: 10, marginBottom: 12 },
  perfil: { fontSize: 10.5 },
  seccionTitulo: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 14,
    marginBottom: 7,
  },
  filaBloque: { flexDirection: "row", justifyContent: "space-between", marginTop: 7 },
  empresa: { fontSize: 10.5, textTransform: "uppercase" },
  derecha: { fontSize: 10.5, textAlign: "right" },
  filaPuesto: { flexDirection: "row", justifyContent: "space-between" },
  puesto: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  fechas: { fontSize: 10.5, textAlign: "right" },
  bulletFila: { flexDirection: "row", marginTop: 3.5, paddingLeft: 10 },
  bulletPunto: { width: 12, fontSize: 10.5 },
  bulletTexto: { flex: 1, fontSize: 10.5 },
  grupoCategoria: { fontSize: 10.5, fontFamily: "Helvetica-Bold", textAlign: "center", marginTop: 6 },
  grupoItems: { fontSize: 10.5, textAlign: "center", marginTop: 1.5 },
});

function lineaContacto(c: ContactoCv): string {
  return [c.telefono, c.email, c.ciudad, c.linkedin].filter(Boolean).join("  ●  ");
}

function Bloque({ b, conBullets }: { b: BloqueCv; conBullets: boolean }) {
  return (
    <View wrap={false}>
      <View style={s.filaBloque}>
        <Text style={s.empresa}>{b.empresa ?? ""}</Text>
        <Text style={s.derecha}>{b.ubicacion ?? ""}</Text>
      </View>
      <View style={s.filaPuesto}>
        <Text style={s.puesto}>{b.puesto ?? ""}</Text>
        <Text style={s.fechas}>{b.fechas ?? ""}</Text>
      </View>
      {conBullets &&
        (b.bullets ?? []).map((bu, i) => (
          <View key={i} style={s.bulletFila}>
            <Text style={s.bulletPunto}>{"•"}</Text>
            <Text style={s.bulletTexto}>{bu.texto}</Text>
          </View>
        ))}
    </View>
  );
}

function Seccion({ sec }: { sec: SeccionCv }) {
  return (
    <View>
      <Text style={s.seccionTitulo}>{sec.titulo.toUpperCase()}</Text>
      {(sec.bloques ?? []).map((b, i) => (
        <Bloque key={i} b={b} conBullets={sec.tipo === "experiencia" || sec.tipo === "otros"} />
      ))}
      {(sec.grupos ?? []).map((g, i) => (
        <View key={i} wrap={false}>
          <Text style={s.grupoCategoria}>{g.categoria}</Text>
          <Text style={s.grupoItems}>{g.items.join(", ")}</Text>
        </View>
      ))}
      {(sec.bullets ?? []).map((bu, i) => (
        <View key={i} style={s.bulletFila}>
          <Text style={s.bulletPunto}>{"•"}</Text>
          <Text style={s.bulletTexto}>{bu.texto}</Text>
        </View>
      ))}
    </View>
  );
}

const ORDEN: Record<string, number> = { experiencia: 2, habilidades: 1, educacion: 3, certificaciones: 4, otros: 5 };

function CvDoc({ cv, contacto }: { cv: CvAdaptado; contacto: ContactoCv }) {
  const secciones = [...cv.secciones].sort((a, b) => (ORDEN[a.tipo] ?? 9) - (ORDEN[b.tipo] ?? 9));
  return (
    <Document title={`CV ${contacto.nombre}`} author={contacto.nombre}>
      <Page size="A4" style={s.page}>
        <Text style={s.nombre}>{contacto.nombre}</Text>
        {lineaContacto(contacto) !== "" && <Text style={s.contacto}>{lineaContacto(contacto)}</Text>}
        <View style={s.regla} />
        <Text style={s.perfil}>{cv.perfil}</Text>
        {secciones.map((sec, i) => (
          <Seccion key={i} sec={sec} />
        ))}
      </Page>
    </Document>
  );
}

// Genera el PDF en el navegador y dispara la descarga.
export async function descargarCvPdf(cv: CvAdaptado, contacto: ContactoCv, empresaOferta?: string) {
  const blob = await pdf(<CvDoc cv={cv} contacto={contacto} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const empresa = empresaOferta ? ` - ${empresaOferta}` : "";
  a.download = `CV - ${contacto.nombre || "Candidato"}${empresa}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
