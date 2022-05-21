import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

function CircularProgressWithIcon({icon, props}) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress {...props} />
      <Box top={0} left={0} bottom={0} right={0} position="absolute" display="flex" alignItems="center" justifyContent="center">
        {icon}
      </Box>
    </Box>
  );
}

CircularProgressWithIcon.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  icon: PropTypes.node.isRequired,
};

export default CircularProgressWithIcon;
