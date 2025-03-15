import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
  Font,
} from '@react-pdf/renderer';
import {
  MachineRentalWithMachineRented,
  MachineRentedWithoutRental,
} from '../utils/types';
import './TermsDocument.css';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlvAw.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 10,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableCell: {
    fontSize: 10,
  },
  signatureArea: {
    height: 150,
    marginTop: 20,
    border: '1px solid #bfbfbf',
    padding: 10,
  },
  signatureImage: {
    maxHeight: 130,
    objectFit: 'contain',
  },
  idCardContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  idCardImage: {
    width: '48%',
    height: 120,
    border: '1px solid #bfbfbf',
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: 'center',
  },
});

interface TermsDocumentProps {
  rental: MachineRentalWithMachineRented;
  machine: MachineRentedWithoutRental;
  frontIdCardImage?: string;
  backIdCardImage?: string;
  signatureDataUrl?: string;
  width?: string | number;
  height?: string | number;
}

const TermsDocument: React.FC<TermsDocumentProps> = ({
  rental,
  machine,
  frontIdCardImage: frontIdCardImageBase64,
  backIdCardImage: backIdCardImageBase64,
  signatureDataUrl,
  width = '100%',
  height = '100%',
}) => {
  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Non spécifié';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Extract customer name from the rental
  const customerName = [rental.clientFirstName, rental.clientLastName]
    .filter(Boolean)
    .join(' ');

  // Combine address components
  const customerAddress = [
    rental.clientAddress,
    rental.clientPostal,
    rental.clientCity,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Document>
      {/* First Page - Rental Details and ID Card */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>
          CONTRAT DE LOCATION DE MATÉRIEL FORESTIER
        </Text>

        <View style={styles.section}>
          <Text style={styles.title}>Informations du Client</Text>
          <Text style={styles.text}>Nom: {customerName || 'Non spécifié'}</Text>
          <Text style={styles.text}>
            Email: {rental.clientEmail || 'Non spécifié'}
          </Text>
          <Text style={styles.text}>
            Téléphone: {rental.clientPhone || 'Non spécifié'}
          </Text>
          <Text style={styles.text}>
            Adresse: {customerAddress || 'Non spécifié'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Détails de la Location</Text>
          <Text style={styles.text}>
            Machine: {machine.name || 'Non spécifié'}
          </Text>
          <Text style={styles.text}>
            Date de début: {formatDate(rental.rentalDate)}
          </Text>
          <Text style={styles.text}>
            Date de fin: {formatDate(rental.returnDate)}
          </Text>
          <Text style={styles.text}>
            Prix:{' '}
            {machine.price_per_day
              ? machine.price_per_day + ' €/jour'
              : 'Non spécifié'}
          </Text>
        </View>

        {(frontIdCardImageBase64 || backIdCardImageBase64) && (
          <View style={styles.section}>
            <Text style={styles.title}>Pièce d'identité</Text>
            <View style={styles.idCardContainer}>
              {frontIdCardImageBase64 ? (
                <Image
                  src={frontIdCardImageBase64}
                  style={styles.idCardImage}
                />
              ) : (
                <View
                  style={[styles.idCardImage, { backgroundColor: '#f0f0f0' }]}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      textAlign: 'center',
                      marginTop: 50,
                    }}
                  >
                    Recto manquant
                  </Text>
                </View>
              )}
              {backIdCardImageBase64 ? (
                <Image
                  src={backIdCardImageBase64}
                  style={{
                    ...styles.idCardImage,
                    width: 250,
                    height: 120,
                  }}
                />
              ) : (
                <View
                  style={[styles.idCardImage, { backgroundColor: '#f0f0f0' }]}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      textAlign: 'center',
                      marginTop: 50,
                    }}
                  >
                    Verso manquant
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          Page 1/3 - FORESTAR - Contrat de location {rental.id}
        </Text>
      </Page>

      {/* Second Page - Terms and Conditions */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>CONDITIONS GÉNÉRALES DE LOCATION</Text>

        <View style={styles.section}>
          <Text style={styles.title}>1. OBJET DU CONTRAT</Text>
          <Text style={styles.text}>
            Le présent contrat a pour objet la location par FORESTAR d'un
            matériel forestier au CLIENT, pour son usage exclusif.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>2. DURÉE DE LA LOCATION</Text>
          <Text style={styles.text}>
            La location prend effet à compter de la date de prise en charge du
            matériel par le CLIENT et se termine à la date convenue de
            restitution.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>3. OBLIGATIONS DU CLIENT</Text>
          <Text style={styles.text}>
            Le CLIENT s'engage à utiliser le matériel conformément à sa
            destination et aux réglementations en vigueur, avec prudence et
            diligence.
          </Text>
          <Text style={styles.text}>
            Le CLIENT s'engage à maintenir le matériel en bon état de
            fonctionnement et à le restituer dans le même état qu'il lui a été
            remis.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>4. RESPONSABILITÉ ET ASSURANCE</Text>
          <Text style={styles.text}>
            Le CLIENT est responsable des dommages causés au matériel pendant la
            durée de la location.
          </Text>
          <Text style={styles.text}>
            Le CLIENT doit être assuré pour la responsabilité civile et les
            dommages au matériel loué.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>5. PAIEMENT</Text>
          <Text style={styles.text}>
            Le prix de la location est fixé selon les tarifs en vigueur au
            moment de la conclusion du contrat.
          </Text>
          <Text style={styles.text}>
            Le paiement doit être effectué selon les modalités convenues entre
            les parties.
          </Text>
        </View>

        <Text style={styles.footer}>
          Page 2/3 - FORESTAR - Contrat de location {rental.id}
        </Text>
      </Page>

      {/* Third Page - Signature */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>VALIDATION DU CONTRAT</Text>

        <View style={styles.section}>
          <Text style={styles.title}>Récapitulatif</Text>
          <Text style={styles.text}>
            Machine louée: {machine.name || 'Non spécifié'}
          </Text>
          <Text style={styles.text}>
            Période de location: du {formatDate(rental.rentalDate)} au{' '}
            {formatDate(rental.returnDate)}
          </Text>
          <Text style={styles.text}>
            Montant total:{' '}
            {machine.price_per_day
              ? machine.price_per_day + ' €'
              : 'Non spécifié'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Acceptation des conditions</Text>
          <Text style={styles.text}>
            En signant ce document, je reconnais avoir lu et accepté les
            conditions générales de location décrites dans ce contrat.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Signature du CLIENT</Text>
          <Text style={styles.text}>
            Fait à ________________, le {formatDate(new Date())}
          </Text>

          <View style={styles.signatureArea}>
            {signatureDataUrl && (
              <Image
                src={signatureDataUrl}
                style={{
                  ...styles.signatureImage,
                  width: 200,
                  height: 130,
                }}
              />
            )}
          </View>
        </View>

        <Text style={styles.footer}>
          Page 3/3 - FORESTAR - Contrat de location {rental.id}
        </Text>
      </Page>
    </Document>
  );
};

export default TermsDocument;
