USE fit_data;

CREATE TABLE User (
  UserID VARCHAR(100) PRIMARY KEY,
  Username VARCHAR(100),
  Passwordd VARCHAR(100),
  Email VARCHAR(100),
  UNIQUE (Email)
 
  
);

CREATE TABLE ProFile (
  ProfileID VARCHAR(100) PRIMARY KEY,
  UserID VARCHAR(100),
  Height Int,
  Weight  Int,
  Age  Int,
  FOREIGN KEY (UserID) REFERENCES User(UserID)
  
);
