/// <reference types="cypress" />

const baseUrl = "http://localhost:3000/api/users";
const baseTweetUrl = "http://localhost:3000/api/tweets";
const baseLikeUrl = "http://localhost:3000/api/likes";
const baseFollowUrl = "http://localhost:3000/api/follows";

export const criarUsuario = (user: any) => {
  return cy.request({
    method: "POST",
    url: baseUrl,
    body: user,
    failOnStatusCode: false,
  });
};

export const registrar = (user: any) => {
  return cy.request({
    method: "POST",
    url: baseUrl, // endpoint público para registro
    body: user,
    failOnStatusCode: false,
  });
};

export const login = (identifier: string, password: string) => {
  return cy.request({
    method: "POST",
    url: `${baseUrl}/login`,
    body: { identifier, password },
    failOnStatusCode: false,
  });
};

export const listarUsuarios = () => {
  return cy.request({
    method: "GET",
    url: baseUrl,
    failOnStatusCode: false,
  });
};

export const buscarPorIdUsuario = (token: string, userId: string) => {
  return cy.request({
    method: "GET",
    url: `${baseUrl}/${userId}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });
};

export const removerUsuario = (token: string, userId: string) => {
  return cy.request({
    method: "DELETE",
    url: `${baseUrl}/${userId}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });
};

export const alternarLike = (token: string, tweetId: string) =>
  cy.request({
    method: "PATCH",
    url: `${baseLikeUrl}/${tweetId}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });

export const criarTweet = (token: string, tweet: any) =>
  cy.request({
    method: "POST",
    url: baseTweetUrl,
    headers: { Authorization: `Bearer ${token}` },
    body: tweet,
    failOnStatusCode: false,
  });

export const criarReply = (token: string, tweetId: string, reply: any) =>
  cy.request({
    method: "POST",
    url: `${baseTweetUrl}/${tweetId}/reply`,
    headers: { Authorization: `Bearer ${token}` },
    body: reply,
    failOnStatusCode: false,
  });

export const buscarPorIdTweet = (token: string, tweetId: string) =>
  cy.request({
    method: "GET",
    url: `${baseTweetUrl}/${tweetId}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });

export const buscarFeedUsuario = (token: string, page = 1, limit = 10) =>
  cy.request({
    method: "GET",
    url: `${baseTweetUrl}/feed?page=${page}&limit=${limit}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });

export const buscarRepliesPaginadas = (
  token: string,
  tweetId: string,
  page = 1,
  limit = 5
) =>
  cy.request({
    method: "GET",
    url: `${baseTweetUrl}/${tweetId}/replies?page=${page}&limit=${limit}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });

export const adicionarLike = (token: string, tweetId: string) =>
  cy.request({
    method: "POST",
    url: `${baseLikeUrl}/${tweetId}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });

export const buscarLike = (token: string, tweetId: string) =>
  cy.request({
    method: "GET",
    url: `${baseLikeUrl}/${tweetId}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });

export const removerLike = (token: string, tweetId: string) =>
  cy.request({
    method: "DELETE",
    url: `${baseLikeUrl}/${tweetId}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });

export const seguirUsuario = (token: string, userId: string) =>
  cy.request({
    method: "POST",
    url: `${baseFollowUrl}/${userId}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });

export const buscarFollow = (token: string, userId: string) =>
  cy.request({
    method: "GET",
    url: `${baseFollowUrl}/${userId}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });

export const deixarDeSeguirUsuario = (token: string, userId: string) =>
  cy.request({
    method: "DELETE",
    url: `${baseFollowUrl}/${userId}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });
