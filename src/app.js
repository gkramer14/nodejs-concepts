const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function getRepoIndex(id) {
  return repositories.findIndex(repo => repo.id === id);
}

function middlewareCheckId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Unrecognized ID' });
  }
  
  return next();
}

function middlewareCheckRepoExist(request, response, next) {
  const { id } = request.params;

  const repoIndex = getRepoIndex(id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: 'Repository not found' });
  }

  request.repoIndex = repoIndex;

  return next();
}

app.use('/repositories/:id', middlewareCheckId, middlewareCheckRepoExist);

app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repo = {
    id: uuid(),
    title, 
    url, 
    techs, 
    likes: 0
  };

  repositories.push(repo);

  return response.status(201).json(repo);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;
  const { repoIndex } = request;

  const repo = {
    ...repositories[repoIndex],
    title,
    url,
    techs,
  };

  repositories[repoIndex] = repo;

  return response.status(200).json(repo);
});

app.delete("/repositories/:id", (request, response) => {
  const { repoIndex } = request;

  repositories.splice(repoIndex, 1);

  return response.status(204).json();
});

app.post("/repositories/:id/like", (request, response) => {
  const { repoIndex } = request;

  const likes = repositories[repoIndex].likes + 1;

  const repo = {
    ...repositories[repoIndex],
    likes,
  };

  repositories[repoIndex] = repo;

  return response.status(201).json(repo);
});

module.exports = app;
