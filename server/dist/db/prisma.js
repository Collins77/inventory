"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const client_1 = require("../generated/prisma/client");
const adapter_libsql_1 = require("@prisma/adapter-libsql");
const adapter = new adapter_libsql_1.PrismaLibSql({
    url: process.env.DATABASE_URL,
});
exports.prisma = new client_1.PrismaClient({ adapter });
