###
### Build Stage
###

# The base go-image
FROM golang:1.22.5-alpine as build-env

# Create a directory for the app
RUN mkdir /app

# Set working directory
WORKDIR /app

# Special thanks to speeding up the docker builds using steps (1) (2) and (3) via:
# https://stackoverflow.com/questions/50520103/speeding-up-go-builds-with-go-1-10-build-cache-in-docker-containers

# (1) Copy your dependency list
COPY go.mod go.sum ./

# (2) Install dependencies
RUN go mod download

# (3) Copy all files from the current directory to the `/app` directory which we are currently in.
COPY . .

# Run command as described:
# go build will build a 64bit Linux executable binary file named server in the current directory
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o workery-backend .

###
### Run stage.
###

FROM alpine:latest

# Copy only required data into this image
COPY --from=build-env /app/workery-backend .

# Copy all the static content necessary for this application to run.
COPY --from=build-env /app/static ./static

# Generate a data folder for the app to save to.
RUN mkdir -p ./data

# Copy all the static content necessary for this application to run.
COPY --from=build-env /app/templates ./templates

EXPOSE 8000

# Run the server executable
CMD [ "/workery-backend" ]

# BUILD
# (Run following from project root directory!)
# docker build -f Dockerfile -t over55/workery-backend:latest --platform linux/amd64 .

# EXECUTE
# docker tag over55/workery-backend:latest over55/workery-backend:latest

# UPLOAD
# docker push over55/workery-backend:latest
