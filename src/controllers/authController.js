import db from '../db.js'
import bcrypt from 'bcrypt'
import { createToken, denyToken } from '../services/tokenService.js'

const sanitizeUser = (u) => ({id: u.id, name: u.name, email: u.email})
