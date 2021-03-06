import { Router } from 'express';

import { groupsService } from '../services';
import { validator } from '../configs/validator';
import {
    updateGroupSchema,
    isBodyEmpty,
    addGroupSchema,
    addUsersToGroupSchema
} from '../utils/validators';

const groupsRouter = Router();

groupsRouter.get('/', (req, res, next) => {
    groupsService
        .getGroups()
        .then((users) => {
            res.json(users);
            next();
        })
        .catch(next);
});

groupsRouter.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const group = await groupsService.getGroup(id);

        if (!group) {
            return next(new Error(`no groups with id=${id}`));
        }

        res.json(group);
        return next();
    } catch (e) {
        return next(e);
    }
});

groupsRouter.post(
    '/',
    validator.body(addGroupSchema),
    async (req, res, next) => {
        try {
            const user = await groupsService.addGroup(req.body);
            res.json(user);
            return next();
        } catch (e) {
            return next(e);
        }
    }
);

groupsRouter.put(
    '/:id',
    validator.body(updateGroupSchema),
    async (req, res, next) => {
        try {
            isBodyEmpty(req.body);
            const updated = await groupsService.updateGroup(
                req.params.id,
                req.body
            );
            res.json(updated);
            return next();
        } catch (e) {
            return next(e);
        }
    }
);

groupsRouter.delete('/:id', async (req, res, next) => {
    try {
        await groupsService.deleteGroup(req.params.id);
        res.status(200).end();
        return next();
    } catch (e) {
        return next(e);
    }
});

groupsRouter.post(
    '/:id/users',
    validator.body(addUsersToGroupSchema),
    async (req, res, next) => {
        try {
            await groupsService.addUsersToGroup(
                req.params.id,
                req.body.userIds
            );
            res.status(200).end();
            return next();
        } catch (e) {
            return next(e);
        }
    }
);

export { groupsRouter };
