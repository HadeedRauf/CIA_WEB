FROM mhart/alpine-node:11 AS builder
WORKDIR /app
ARG REACT_APP_API_URL=localhost:3000
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_OPTIONS=--max_old_space_size=512
COPY . .
RUN yarn install
RUN yarn build
FROM nginx
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
