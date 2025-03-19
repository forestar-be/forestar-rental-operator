import { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography, Divider } from '@mui/material';
import RentalTermsEditor from '../components/RentalTermsEditor';
import RentalTermsPreview from '../components/RentalTermsPreview';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ p: 3, height: '100%' }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const Settings = (): JSX.Element => {
  const [tabValue, setTabValue] = useState(0);
  const { terms } = useSelector((state: RootState) => state.rentalTerms);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      id="settingsPage"
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{ px: 2 }}
        >
          <Tab label="Conditions Générales" {...a11yProps(0)} />
          <Tab label="Prévisualisation" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <RentalTermsEditor />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box mb={3}>
          <Typography variant="h5" component="h2">
            Prévisualisation des Conditions Générales
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Voici comment les conditions générales seront affichées dans le
            contrat.
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <RentalTermsPreview terms={terms} />
      </TabPanel>
    </Paper>
  );
};

export default Settings;
