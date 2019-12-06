# Services

## Getting Started

#### build project

```
docker -t repair build .
```

#### run project

```
docker run -v $(pwd):/backend -p 8000:8000 -t repair
```

#### init db schema
```
docker exec -i dc3229e407f5 python manage.py migrate
```
