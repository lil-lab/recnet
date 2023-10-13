import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

const dates = ["Tuesday 1", "Tuesday 2", "Tuesday 3"]; // Replace with your date data

function Sidebar() {
  return (
    <List>
      {dates.map((date, index) => (
        <ListItem button key={index}>
          <ListItemText primary={date} />
        </ListItem>
      ))}
    </List>
  );
}

export default Sidebar;
