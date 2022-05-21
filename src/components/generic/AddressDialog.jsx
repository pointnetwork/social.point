
import { Button,
        Box,
        Dialog,
        DialogContent,
        DialogActions,
        Typography,  
} from '@material-ui/core';

import DialogTitle from './DialogTitle';

import QRCode from "react-qr-code";

const AddressDialog = ({open, address, caption, onClose, setAlert}) => {
    const copy = async () => {
        try {
            await window.navigator.clipboard.writeText(address);
            setAlert("Copied to clipboard!|success");
        }
        catch(error) {
            setAlert(error.message);
        }
    }
    return (
        <Dialog aria-labelledby="dialog-address" open={open}>
            <DialogTitle id="dialog-address-title" onClose={onClose}>
                {caption}
            </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <QRCode value={address}/>
            <Typography variant="caption" gutterBottom={true} style={{paddingTop:'10px'}}>{address}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={copy} color="primary" autoFocus>
            Copy
          </Button>
        </DialogActions>
      </Dialog>
    )
} 

export default AddressDialog;