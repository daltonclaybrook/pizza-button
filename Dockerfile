FROM amazonlinux:latest

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 4.3.2
ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Install dependencies
RUN yum -y update && \
    yum -y install zip && \
    yum -y install gcc-c++ make && \
    yum -y install findutils

# Install nvm with node and npm
RUN touch ~/.bash_profile && \
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash && \
    source $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default

# Install app dependencies and build archive
WORKDIR /app
COPY . .
RUN rm -rf node_modules && \
    npm install && \
    zip -r archive.zip index.js node_modules
