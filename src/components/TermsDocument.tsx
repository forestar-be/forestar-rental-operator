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
  RentalTerm,
  RentalTermType,
} from '../utils/types';
import './TermsDocument.css';
import { formatPriceNumberToFrenchFormatStr } from '../utils/common.utils';

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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    width: '48%',
  },
  titleTerms: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'red',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  subtitle2: {
    fontSize: 11,
    fontStyle: 'italic',
    paddingLeft: 5,
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
  idCardImageContainer: {
    width: '48%',
    height: 120,
    border: '1px solid #bfbfbf',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idCardImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  machinePhotosContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  machinePhotoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  machinePhotosGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 5,
  },
  machinePhotoContainer: {
    width: '48%',
    height: 120,
    margin: 3,
    border: '1px solid #bfbfbf',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  machinePhoto: {
    maxWidth: '100%',
    maxHeight: '100%',
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
  machinePhotos?: string[];
  signatureDataUrl?: string;
  signatureLocation?: string;
  width?: string | number;
  height?: string | number;
  terms: RentalTerm[];
}

const TermsDocument: React.FC<TermsDocumentProps> = ({
  rental,
  machine,
  frontIdCardImage: frontIdCardImageBase64,
  backIdCardImage: backIdCardImageBase64,
  machinePhotos = [],
  signatureDataUrl,
  signatureLocation,
  width = '100%',
  height = '100%',
  terms = [],
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

  // Function to render terms based on their type
  const renderTerm = (term: RentalTerm) => {
    switch (term.type) {
      case RentalTermType.TITLE:
        return <Text style={styles.titleTerms}>{term.content}</Text>;
      case RentalTermType.SUBTITLE:
        return <Text style={styles.subtitle}>{term.content}</Text>;
      case RentalTermType.SUBTITLE2:
        return <Text style={styles.subtitle2}>{term.content}</Text>;
      case RentalTermType.PARAGRAPH:
      default:
        return (
          <Text key={term.id} style={styles.text}>
            {term.content}
          </Text>
        );
    }
  };

  return (
    <Document>
      {/* First Page - Rental Details and ID Card */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>
          CONTRAT DE LOCATION DE MATÉRIEL FORESTIER
        </Text>

        <View style={styles.rowContainer}>
          <View style={styles.column}>
            <Text style={styles.title}>Informations du Client</Text>
            <Text style={styles.text}>
              Nom: {customerName || 'Non spécifié'}
            </Text>
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

          <View style={styles.column}>
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
            <Text style={styles.text}>
              Avec livraison: {rental.with_shipping ? 'Oui' : 'Non'}
            </Text>
          </View>
        </View>

        {(frontIdCardImageBase64 || backIdCardImageBase64) && (
          <View style={styles.section}>
            <Text style={styles.title}>Pièce d'identité</Text>
            <View style={styles.idCardContainer}>
              {frontIdCardImageBase64 ? (
                <View style={styles.idCardImageContainer}>
                  <Image
                    src={frontIdCardImageBase64}
                    style={styles.idCardImage}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.idCardImageContainer,
                    { backgroundColor: '#f0f0f0' },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      textAlign: 'center',
                    }}
                  >
                    Recto manquant
                  </Text>
                </View>
              )}
              {backIdCardImageBase64 ? (
                <View style={styles.idCardImageContainer}>
                  <Image
                    src={backIdCardImageBase64}
                    style={styles.idCardImage}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.idCardImageContainer,
                    { backgroundColor: '#f0f0f0' },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      textAlign: 'center',
                    }}
                  >
                    Verso manquant
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Machine Photos */}
        {machinePhotos && machinePhotos.length > 0 && (
          <View style={styles.machinePhotosContainer}>
            <Text style={styles.machinePhotoTitle}>Photos de la machine</Text>
            <View style={styles.machinePhotosGrid}>
              {machinePhotos.map((photo, index) => (
                <View
                  key={`machine-photo-${index}`}
                  style={styles.machinePhotoContainer}
                >
                  <Image src={photo} style={styles.machinePhoto} />
                </View>
              ))}
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

        {terms && terms.length > 0 ? (
          <View style={styles.section}>
            {terms.map((term) => renderTerm(term))}
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.title}>
                ERREUR : Aucune condition générale de location trouvée
              </Text>
            </View>
          </>
        )}

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
            {rental.totalPrice
              ? formatPriceNumberToFrenchFormatStr(rental.totalPrice)
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
            Fait à {signatureLocation || '________________'}, le{' '}
            {formatDate(new Date())}
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
