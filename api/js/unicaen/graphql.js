import API_URL from "./apiUrl.js";

export function graphqlRequest(query, variables = {}, token) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    })
    .then(body => {
      if (body.errors?.length) {
        const error = new Error(
          body.errors.map(item => item.message).join("\n")
        );

        error.graphqlErrors = body.errors;
        throw error;
      }

      if (!body.data) {
        throw new Error("Réponse GraphQL sans données.");
      }

      return body.data;
    });
}