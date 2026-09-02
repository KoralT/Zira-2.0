import { useState } from 'react';
import { Modal } from './Modal';
import { users } from '../../data';
import { useStore } from '../../store/StoreContext';
import type { TaskSourceType } from '../../data/types';

interface Props {
  onClose: () => void;
  defaultTitle?: string;
  defaultMissionId?: string;
  sourceType: TaskSourceType;
  sourceId?: string;
  onCreated?: () => void;
}

export function CreateTaskModal({ onClose, defaultTitle = '', defaultMissionId, sourceType, sourceId, onCreated }: Props) {
  const { createTask, currentUserId, missions } = useStore();
  const [title, setTitle] = useState(defaultTitle);
  const [assigneeUserId, setAssigneeUserId] = useState(currentUserId);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [missionId, setMissionId] = useState(defaultMissionId ?? '');
  const [dueDate, setDueDate] = useState('2026-07-23');

  const submit = () => {
    if (!title.trim()) return;
    createTask({ title, priority, dueDate: `${dueDate}T12:00:00`, missionId: missionId || undefined, assigneeUserId, sourceType, sourceId });
    onCreated?.();
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="modal-title">יצירת משימת המשך</div>
      <div className="field">
        <label>כותרת המשימה</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="לדוגמה: לבדוק ולעדכן Evidence" />
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label>מוקצה ל</label>
          <select value={assigneeUserId} onChange={e => setAssigneeUserId(e.target.value)}>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} · {u.roleLabel}</option>)}
          </select>
        </div>
        <div className="field">
          <label>עדיפות</label>
          <select value={priority} onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
            <option value="low">נמוכה</option>
            <option value="medium">בינונית</option>
            <option value="high">גבוהה</option>
          </select>
        </div>
        <div className="field">
          <label>מבצע קשור</label>
          <select value={missionId} onChange={e => setMissionId(e.target.value)}>
            <option value="">ללא</option>
            {missions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>תאריך יעד</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>
      <div className="btn-row mt-14">
        <button className="btn btn-primary" onClick={submit}>צור משימה</button>
        <button className="btn" onClick={onClose}>ביטול</button>
      </div>
    </Modal>
  );
}
