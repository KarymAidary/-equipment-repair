# Services

## Getting Started

#### build project

```
docker -t repair build .
```

#### run project

```
docker run --name service -v $(pwd):/backend -p 8000:8000 -t repair
```

#### init db schema
```
docker exec -i service python manage.py migrate 
```
