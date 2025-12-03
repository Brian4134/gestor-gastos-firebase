# 🚀 Configuración de Vercel

## Variables de Entorno Requeridas

En el dashboard de Vercel, configura estas variables de entorno:

### Firebase Configuration
```
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto-id.iam.gserviceaccount.com
```

### Firebase Client (Frontend)
```
FIREBASE_API_KEY=tu-api-key
FIREBASE_AUTH_DOMAIN=tu-proyecto-id.firebaseapp.com
```

### Session
```
SESSION_SECRET=tu_secreto_super_seguro_para_produccion
```

### Node Environment
```
NODE_ENV=production
```

## Pasos para Desplegar

1. **Conectar repositorio**: En Vercel dashboard, importa tu repositorio de GitHub
2. **Configurar variables**: Agrega todas las variables de entorno listadas arriba
3. **Deploy**: Vercel desplegará automáticamente

## Notas Importantes

- La `FIREBASE_PRIVATE_KEY` debe incluir los `\n` literales para los saltos de línea
- Asegúrate de que las reglas de Firestore permitan acceso desde el dominio de Vercel
- El proyecto se desplegará automáticamente en cada push a la rama principal

## Configuración de Dominio Firebase

En Firebase Console:
1. Ve a Authentication → Settings → Authorized domains
2. Agrega tu dominio de Vercel: `tu-app.vercel.app`