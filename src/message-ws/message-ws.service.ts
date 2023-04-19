import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

interface ConnectedClients {
  [id: string]: {
    socket:Socket,
    user: User
  }
}

@Injectable()
export class MessageWsService {
  private connectedClients: ConnectedClients = {}

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){

  }

  async registerClient(client: Socket, userId: string){
    const user = await this.userRepository.findOneBy({ id: userId });
    if(!user) throw new Error('User not found');
    if(!user.isActive) throw new Error('User not active');

    this.checkUserConnection(user);

    this.connectedClients[client.id] = {
      socket: client,
      user
    };
  }

  removeClient( clientId: string ){
    delete this.connectedClients[clientId];
  }

  getConnectedClients():number{
    return Object.keys(this.connectedClients).length
  }

  getConnectedClientsIds(): string[]{
    return Object.keys(this.connectedClients);
  }

  getUserFullName(socketId: string){
    return this.connectedClients[socketId].user.fullName;
  }

  private checkUserConnection(user: User){
    for(const clientd of Object.keys(this.checkUserConnection)){
      const connectedClient = this.connectedClients[clientd];
      if(connectedClient.user.id === user.id){
        connectedClient.socket.disconnect();
        break;
      }
    }
  }
}
