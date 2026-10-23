const r=require('express').Router();
const {wrap,auth,admin}=require('../middleware/auth');
const c=require('../controllers');const {Color,Pattern}=require('../models');
r.post('/auth/register',wrap(c.register)); r.post('/auth/login',wrap(c.login)); r.get('/auth/me',auth,wrap(c.me));
for(const [p,M,l] of [['colors',Color,'Color'],['patterns',Pattern,'Pattern']]){ const k=c.crud(M,l);
 r.get(`/${p}`,auth,wrap(k.list)); r.get(`/${p}/:id`,auth,wrap(k.get)); r.post(`/${p}`,auth,admin,wrap(k.create)); r.put(`/${p}/:id`,auth,admin,wrap(k.update)); r.delete(`/${p}/:id`,auth,admin,wrap(k.remove)); }
r.get('/projects',auth,wrap(c.projects.list)); r.post('/projects',auth,wrap(c.projects.create));
r.get('/projects/:id',auth,wrap(c.projects.get)); r.put('/projects/:id',auth,wrap(c.projects.update)); r.delete('/projects/:id',auth,wrap(c.projects.remove));
r.get('/users',auth,admin,wrap(c.users.list)); r.get('/users/:id',auth,admin,wrap(c.users.get));
r.get('/analytics',auth,admin,wrap(c.analytics)); r.get('/activity',auth,admin,wrap(c.activity.list)); r.post('/activity',auth,wrap(c.activity.create));
r.post('/feedback',auth,wrap(c.feedback.create)); r.get('/feedback',auth,admin,wrap(c.feedback.list));
module.exports=r;
