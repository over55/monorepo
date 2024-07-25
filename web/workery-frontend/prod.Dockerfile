# Build environment.
FROM node:14-alpine AS builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Get environment variables from the build.
ARG REACT_APP_API_HOST
ARG REACT_APP_API_DOMAIN
ARG REACT_APP_API_PROTOCOL
ARG REACT_APP_WWW_DOMAIN
ARG REACT_APP_WWW_PROTOCOL
ARG REACT_APP_IMAGE_UPLOAD_MAX_FILESIZE_IN_BYTES
ARG REACT_APP_IMAGE_UPLOAD_MAX_FILESIZE_ERROR_MESSAGE

# Set environment variables in this image when built.
# Apply environment variables with the build.
RUN REACT_APP_API_HOST=${REACT_APP_API_HOST} \
  REACT_APP_API_DOMAIN=${REACT_APP_API_DOMAIN} \
  REACT_APP_API_PROTOCOL=${REACT_APP_API_PROTOCOL} \
  REACT_APP_WWW_DOMAIN=${REACT_APP_WWW_DOMAIN} \
  REACT_APP_WWW_PROTOCOL=${REACT_APP_WWW_PROTOCOL} \
  REACT_APP_IMAGE_UPLOAD_MAX_FILESIZE_IN_BYTES=${REACT_APP_IMAGE_UPLOAD_MAX_FILESIZE_IN_BYTES} \
  REACT_APP_IMAGE_UPLOAD_MAX_FILESIZE_ERROR_MESSAGE=${REACT_APP_IMAGE_UPLOAD_MAX_FILESIZE_ERROR_MESSAGE}

# Verify environment variables work.
RUN echo "$REACT_APP_API_HOST"
RUN echo "$REACT_APP_API_DOMAIN"
RUN echo "$REACT_APP_API_PROTOCOL"
RUN echo "$REACT_APP_WWW_DOMAIN"
RUN echo "$REACT_APP_WWW_PROTOCOL"
RUN echo "$REACT_APP_IMAGE_UPLOAD_MAX_FILESIZE_IN_BYTES"
RUN echo "$REACT_APP_IMAGE_UPLOAD_MAX_FILESIZE_ERROR_MESSAGE"

# Install dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 1000000

# Copy source code.
COPY . .

# Build production instance.
RUN yarn build

# Copy into minimalist Nginx server.
# # SPECIAL THANKS: https://rsbh.dev/blog/dockerize-react-app
FROM nginx:1.19-alpine AS server
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder ./app/build /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

### BUILD
# docker build -f prod.Dockerfile -t over55/workery-frontend:prod-latest --platform linux/amd64 --build-arg REACT_APP_API_HOST=https://theworkery.cloud --build-arg REACT_APP_API_DOMAIN=theworkery.cloud --build-arg REACT_APP_API_PROTOCOL=https --build-arg REACT_APP_WWW_DOMAIN=theworkery.app --build-arg REACT_APP_WWW_PROTOCOL=https --build-arg REACT_APP_IMAGE_UPLOAD_MAX_FILESIZE_IN_BYTES=10485760 --build-arg REACT_APP_IMAGE_UPLOAD_MAX_FILESIZE_ERROR_MESSAGE="File is too large. The maximum size is 10 MB." .

### TAG
# docker tag over55/workery-frontend:prod-latest over55/workery-frontend:prod-latest

### UPLOAD
# docker push over55/workery-frontend:prod-latest
