import { Client } from "../login/login.component";

export const getUserById = async (id: string): Promise<Client | undefined> => {
  const response = await fetch(
    `http://localhost:8080/medplaya/client/find/${id}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return (await response.json()) as Client;
};