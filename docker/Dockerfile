FROM nikolaik/python-nodejs:python3.7-nodejs14

RUN mkdir -p /srv/http/acld
WORKDIR /srv/http/acld

COPY . .

RUN npm install
RUN cd client && npm install && cd ..
RUN pip3 install --no-cache-dir -U pip &&\
    pip3 install --no-cache-dir -U -r requirements.txt

EXPOSE 5000
CMD [ "npm", "start" ]