import { createContext, useState, useContext } from 'react';

const NavbarActionContext = createContext();

export const useNavbarAction = () => useContext(NavbarActionContext);

export const NavbarActionProvider = ({ children }) => {
  const [action, setAction] = useState(null);

  return (
    <NavbarActionContext.Provider value={{ action, setAction }}>
      {children}
    </NavbarActionContext.Provider>
  );
};