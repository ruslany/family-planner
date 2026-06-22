import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Member } from '@/lib/types';

interface MemberAvatarProps {
  member: Pick<Member, 'name' | 'image'>;
  size?: 'sm' | 'default';
}

export function MemberAvatar({ member, size = 'default' }: MemberAvatarProps) {
  const initial = member.name.trim()[0]?.toUpperCase() ?? '?';
  return (
    <Avatar size={size} title={member.name}>
      {member.image && <AvatarImage src={member.image} alt={member.name} />}
      <AvatarFallback>{initial}</AvatarFallback>
    </Avatar>
  );
}
