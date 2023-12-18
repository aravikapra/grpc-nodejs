const grpc = require('@grpc/grpc-js');
const axios = require('axios');
const protoLoader = require('@grpc/proto-loader');

// Load proto file using @grpc/proto-loader
const packageDefinition = protoLoader.loadSync('./proto/api.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load package definition using loadPackageDefinition
const apiProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(apiProto.ApiService.service, {
    GetMahasiswaInfoAll: async (_, callback) => {
    try {
      // Mendapatkan resource_id dari panggilan gRPC
    //   const resourceId = call.request.resource_id;
      

      // Memanggil API REST
      const response = await axios.get(`http://registrasi.digitalevent.id/api/mahasiswa-registrasi/`);

      // Mendapatkan data dari respons API REST
      const responseData = response.data.data;
      // Mengirim respons ke panggilan gRPC
      const grpcResponse = {mahasiswas: responseData};
      console.log(responseData);
      callback(null, grpcResponse);
    } catch (error) {
      console.error('Error:', error.message);

      // Menangani kesalahan dan mengembalikan kesalahan ke panggilan gRPC
      const grpcError = {
        code: grpc.status.INTERNAL,
        details: 'Internal Server Error',
      };
      callback(grpcError);
    }
  },
});

const PORT = 50051;
server.bindAsync(`localhost:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`Server running at http://localhost:${PORT}`);
  server.start();
});
