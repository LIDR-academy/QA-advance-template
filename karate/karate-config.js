function fn() {
  karate.configure('logPrettyRequest', true);
  karate.configure('logPrettyResponse', true);
  karate.configure('printEnabled', true);
  
  return {
    baseUrl: 'http://127.0.0.1:4010'
  };
}
